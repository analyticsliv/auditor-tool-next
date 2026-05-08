import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agency from '@/models/agency';
import User from '@/models/user';
import Invitation from '@/models/invitation';
import { requireSuperAdmin } from '@/app/utils/authGuard';
import { logActivity } from '@/app/utils/activityLogger';
import { sendEmail } from '@/app/utils/sendMail';
import { generateAgencyAdminWelcomeEmail } from '@/app/utils/invitationEmailTemplate';
import { PLANS, ROLES, ACTIONS, QUOTA_WINDOW_DAYS, addDays } from '@/app/config/plans';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
    const guard = await requireSuperAdmin();
    if (guard.error) return guard.error;
    await connectDB();
    const agencies = await Agency.find({}).sort({ createdAt: -1 }).lean();
    const ids = agencies.map(a => a.agencyId);
    const seatCounts = await User.aggregate([
        { $match: { agencyId: { $in: ids } } },
        { $group: { _id: '$agencyId', count: { $sum: 1 } } },
    ]);
    const seatMap = Object.fromEntries(seatCounts.map(s => [s._id, s.count]));

    const adminAgg = await User.aggregate([
        { $match: { agencyId: { $in: ids }, role: 'agencyAdmin' } },
        { $group: { _id: '$agencyId', emails: { $push: '$email' } } },
    ]);
    const adminMap = Object.fromEntries(adminAgg.map(a => [a._id, a.emails]));

    const pendingInvites = await Invitation.find({
        agencyId: { $in: ids },
        role: 'agencyAdmin',
        status: 'pending',
    }).select('agencyId email _id expiresAt').lean();
    const pendingMap = {};
    for (const p of pendingInvites) {
        if (!pendingMap[p.agencyId]) pendingMap[p.agencyId] = { email: p.email, invitationId: p._id, expiresAt: p.expiresAt };
    }

    const enriched = agencies.map(a => ({
        ...a,
        seatsUsed: seatMap[a.agencyId] || 0,
        adminEmails: adminMap[a.agencyId] || [],
        hasAdmin: (adminMap[a.agencyId] || []).length > 0,
        pendingAdminInvite: pendingMap[a.agencyId] || null,
    }));
    return NextResponse.json({ success: true, agencies: enriched });
}

export async function POST(req) {
    const guard = await requireSuperAdmin();
    if (guard.error) return guard.error;
    try {
        await connectDB();
        const { name, plan, adminEmail } = await req.json();
        if (!name || !plan || !['pro', 'premium'].includes(plan)) {
            return NextResponse.json({ error: 'name and plan (pro|premium) are required' }, { status: 400 });
        }
        const email = (adminEmail || '').toLowerCase().trim();
        if (!email || !EMAIL_RE.test(email)) {
            return NextResponse.json({ error: 'A valid agency admin email is required' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser?.agencyId) {
            return NextResponse.json({ error: `${email} already belongs to another agency` }, { status: 400 });
        }
        if (existingUser?.role === ROLES.SUPER_ADMIN) {
            return NextResponse.json({ error: `${email} is a super admin and cannot be assigned as agency admin` }, { status: 400 });
        }

        const planDef = PLANS[plan];
        const now = new Date();
        const agency = await Agency.create({
            name: name.trim(),
            plan,
            seatLimit: planDef.seatLimit,
            auditLimit: planDef.auditLimit,
            chatbotLimit: planDef.chatbotLimit,
            quotaStartDate: now,
            quotaResetDate: addDays(now, QUOTA_WINDOW_DAYS),
            createdBy: guard.user.email,
        });

        // Helper: roll back the agency we just created. Used whenever admin
        // assignment fails so we never leave an orphan agency behind.
        const rollbackAgency = async (reason) => {
            try {
                await Agency.deleteOne({ agencyId: agency.agencyId });
                console.error(`[agency-create] rolled back agency ${agency.agencyId} — ${reason}`);
            } catch (rollbackErr) {
                console.error(`[agency-create] CRITICAL: rollback also failed for ${agency.agencyId}`, rollbackErr);
            }
        };

        // Assign the admin directly — no invitation step.
        // Wrapped in its own try/catch so a thrown error here triggers the
        // agency rollback instead of falling through to the generic 500.
        let adminUser;
        try {
            if (existingUser) {
                adminUser = await User.findOneAndUpdate(
                    { email },
                    {
                        $set: {
                            role: ROLES.AGENCY_ADMIN,
                            agencyId: agency.agencyId,
                            status: 'active',
                            invitedBy: guard.user.email,
                        },
                    },
                    { new: true }
                );
            } else {
                adminUser = await User.create({
                    email,
                    role: ROLES.AGENCY_ADMIN,
                    agencyId: agency.agencyId,
                    status: 'active',
                    invitedBy: guard.user.email,
                    lastLogin: now,
                    auditCount: 0,
                    auditLimit: PLANS.free.auditLimit,
                    chatbotCount: 0,
                    chatbotLimit: PLANS.free.chatbotLimit,
                    quotaStartDate: now,
                    quotaResetDate: addDays(now, QUOTA_WINDOW_DAYS),
                });
            }
        } catch (assignErr) {
            await rollbackAgency(`admin assignment threw: ${assignErr?.message || assignErr}`);
            return NextResponse.json(
                { error: `Failed to assign ${email} as agency admin: ${assignErr?.message || 'unknown error'}` },
                { status: 500 }
            );
        }

        console.log('[agency-create] admin assignment result:', {
            email,
            preExisting: !!existingUser,
            written: adminUser ? { role: adminUser.role, agencyId: adminUser.agencyId, status: adminUser.status } : 'null',
        });

        if (!adminUser || adminUser.role !== ROLES.AGENCY_ADMIN || adminUser.agencyId !== agency.agencyId) {
            await rollbackAgency('admin assignment did not persist with expected fields');
            return NextResponse.json({
                error: 'Agency could not be created — admin assignment did not persist. Please try again.',
            }, { status: 500 });
        }

        // Both writes succeeded. From here on, errors must NOT cause a 500 —
        // the agency + admin are already committed, so we'd be lying to the
        // client. Wrap remaining best-effort calls so they can't bubble.
        try {
            await logActivity({
                userEmail: guard.user.email,
                agencyId: agency.agencyId,
                action: ACTIONS.AGENCY_CREATED,
                metadata: { name: agency.name, plan, adminEmail: email },
            });
            await logActivity({
                userEmail: guard.user.email,
                agencyId: agency.agencyId,
                action: ACTIONS.ADMIN_ASSIGNED,
                metadata: { adminEmail: email, preExisting: !!existingUser },
            });
        } catch (logErr) {
            console.error('[agency-create] activity log failed (non-fatal):', logErr);
        }

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const dashboardUrl = `${baseUrl}/agency/welcome`;
        const mail = generateAgencyAdminWelcomeEmail({
            email,
            inviterEmail: guard.user.email,
            agencyName: agency.name,
            plan,
            dashboardUrl,
        });

        let emailSent = true;
        try {
            await sendEmail(mail.to, mail.subject, mail.html, 'support@analyticsliv.com');
        } catch (e) {
            emailSent = false;
            console.error('Agency admin welcome email failed:', e);
        }

        return NextResponse.json({
            success: true,
            agency,
            adminEmail: email,
            adminPreExisting: !!existingUser,
            emailSent,
            dashboardUrl,
        }, { status: 201 });
    } catch (err) {
        console.error('agency create error', err);
        return NextResponse.json({ error: 'Failed to create agency' }, { status: 500 });
    }
}
