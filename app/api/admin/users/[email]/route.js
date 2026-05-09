import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { requireSuperAdmin } from '@/app/utils/authGuard';
import { logActivity } from '@/app/utils/activityLogger';
import { ROLES, ACTIONS, PLANS, QUOTA_WINDOW_DAYS, addDays, SUPER_ADMIN_EMAIL } from '@/app/config/plans';

export async function PATCH(req, { params }) {
    const guard = await requireSuperAdmin();
    if (guard.error) return guard.error;
    try {
        await connectDB();
        const email = decodeURIComponent((await params).email).toLowerCase();
        const body = await req.json();
        const user = await User.findOne({ email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (body.auditLimitOverride !== undefined) user.auditLimitOverride = body.auditLimitOverride;
        if (body.chatbotLimitOverride !== undefined) user.chatbotLimitOverride = body.chatbotLimitOverride;
        if (body.auditLimit !== undefined) user.auditLimit = body.auditLimit;
        if (body.chatbotLimit !== undefined) user.chatbotLimit = body.chatbotLimit;
        if (body.status) user.status = body.status;
        if (body.resetCounts) { user.auditCount = 0; user.chatbotCount = 0; }

        await user.save();
        await logActivity({
            userEmail: guard.user.email,
            agencyId: user.agencyId,
            action: ACTIONS.LIMIT_OVERRIDDEN,
            metadata: { target: email, body },
        });
        return NextResponse.json({ success: true, user });
    } catch (err) {
        console.error('user patch error', err);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const guard = await requireSuperAdmin();
    if (guard.error) return guard.error;
    await connectDB();
    const email = decodeURIComponent((await params).email).toLowerCase();
    if (email === SUPER_ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 400 });
    }
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Default behaviour is soft-detach (move them back to free tier). Pass
    // ?hard=true to actually wipe the User row — useful only for spam /
    // GDPR-style account removal, not for the normal "remove from agency".
    const { searchParams } = new URL(req.url);
    const hard = searchParams.get('hard') === 'true';
    const previousRole = user.role;
    const previousAgencyId = user.agencyId;

    if (hard) {
        await User.deleteOne({ email });
    } else {
        // Soft-detach to free tier. Keeps the user's identity, just resets
        // the agency membership, role, and personal quota.
        const now = new Date();
        await User.updateOne(
            { email },
            {
                $set: {
                    agencyId: null,
                    role: ROLES.FREE_USER,
                    invitedBy: null,
                    status: 'active',
                    auditLimit: PLANS.free.auditLimit,
                    chatbotLimit: PLANS.free.chatbotLimit,
                    auditCount: 0,
                    chatbotCount: 0,
                    auditLimitOverride: null,
                    chatbotLimitOverride: null,
                    quotaStartDate: now,
                    quotaResetDate: addDays(now, QUOTA_WINDOW_DAYS),
                },
            }
        );
    }

    await logActivity({
        userEmail: guard.user.email,
        agencyId: previousAgencyId,
        action: ACTIONS.USER_DELETED,
        metadata: { target: email, mode: hard ? 'hard' : 'detached', previousRole },
    });
    return NextResponse.json({ success: true, mode: hard ? 'hard' : 'detached', email });
}
