import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { ROLES, SUPER_ADMIN_EMAIL, PLANS, QUOTA_WINDOW_DAYS, addDays } from '@/app/config/plans';

export async function getSessionUser() {
    try {
        const session = await getServerSession(authOptions);
        let email = session?.user?.email;
        if (!email) {
            try {
                const cookieStore = cookies();
                const allCookies = cookieStore.getAll();
                const reqLike = {
                    headers: { cookie: allCookies.map(c => `${c.name}=${c.value}`).join('; ') },
                    cookies: Object.fromEntries(allCookies.map(c => [c.name, c.value])),
                };
                const token = await getToken({ req: reqLike, secret: process.env.NEXTAUTH_SECRET });
                if (token?.email) email = token.email;
            } catch (e) {
                console.error('getSessionUser getToken fallback error', e);
            }
        }
        if (!email) return null;

        await connectDB();
        email = email.toLowerCase().trim();
        const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
        const sessionName = session?.user?.name;

        // Atomic create-or-return. findOneAndUpdate with upsert is race-safe,
        // doesn't swallow legacy duplicate-key errors silently, and gives us
        // back the resulting document in one round trip.
        const now = new Date();
        let user;
        try {
            user = await User.findOneAndUpdate(
                { email },
                {
                    $setOnInsert: {
                        email,
                        role: isSuperAdmin ? ROLES.SUPER_ADMIN : ROLES.FREE_USER,
                        auditCount: 0,
                        auditLimit: PLANS.free.auditLimit,
                        chatbotCount: 0,
                        chatbotLimit: PLANS.free.chatbotLimit,
                        quotaStartDate: now,
                        quotaResetDate: addDays(now, QUOTA_WINDOW_DAYS),
                        status: 'active',
                    },
                    $set: {
                        ...(sessionName ? { name: sessionName } : {}),
                        lastLogin: now,
                    },
                },
                { upsert: true, new: true, lean: true, setDefaultsOnInsert: true }
            );
        } catch (e) {
            // Loud log so legacy-index issues don't hide silently anymore.
            console.error(
                '[getSessionUser] upsert failed for', email,
                'code:', e?.code, 'name:', e?.codeName, 'msg:', e?.message
            );
            // Last-ditch attempt to read the doc — covers the case where a
            // concurrent call upserted while we were failing.
            user = await User.findOne({ email }).lean();
        }
        if (!user) return null;

        if (isSuperAdmin && user.role !== ROLES.SUPER_ADMIN) {
            await User.updateOne({ email }, { $set: { role: ROLES.SUPER_ADMIN } });
            user.role = ROLES.SUPER_ADMIN;
        }

        // Lazy backfill for legacy users created before role/chatbot/quota fields existed.
        const backfill = {};
        if (user.role == null) backfill.role = isSuperAdmin ? ROLES.SUPER_ADMIN : ROLES.FREE_USER;
        if (user.status == null) backfill.status = 'active';
        if (user.chatbotCount == null) backfill.chatbotCount = 0;
        if (user.chatbotLimit == null) backfill.chatbotLimit = PLANS.free.chatbotLimit;
        if (user.auditCount == null) backfill.auditCount = 0;
        if (user.auditLimit == null) backfill.auditLimit = PLANS.free.auditLimit;
        if (user.quotaStartDate == null) backfill.quotaStartDate = new Date();
        if (user.quotaResetDate == null) backfill.quotaResetDate = addDays(new Date(), QUOTA_WINDOW_DAYS);
        if (Object.keys(backfill).length) {
            await User.updateOne({ email }, { $set: backfill });
            Object.assign(user, backfill);
        }

        return user;
    } catch (err) {
        console.error('getSessionUser fatal', err);
        return null;
    }
}

export async function requireSuperAdmin() {
    const user = await getSessionUser();
    if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    if (user.email !== SUPER_ADMIN_EMAIL && user.role !== ROLES.SUPER_ADMIN) {
        return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }
    return { user };
}

export async function requireAgencyAdmin() {
    const user = await getSessionUser();
    if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    if (user.role !== ROLES.AGENCY_ADMIN && user.email !== SUPER_ADMIN_EMAIL) {
        return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }
    return { user };
}

export async function requireAuthenticated() {
    const user = await getSessionUser();
    if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    return { user };
}
