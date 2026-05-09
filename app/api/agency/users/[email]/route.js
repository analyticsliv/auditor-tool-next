import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { getSessionUser } from '@/app/utils/authGuard';
import { logActivity } from '@/app/utils/activityLogger';
import { ROLES, ACTIONS, PLANS, QUOTA_WINDOW_DAYS, addDays } from '@/app/config/plans';

export async function DELETE(_req, { params }) {
    const me = await getSessionUser();
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (me.role !== ROLES.AGENCY_ADMIN || !me.agencyId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const email = decodeURIComponent((await params).email).toLowerCase();
    const target = await User.findOne({ email });
    if (!target || target.agencyId !== me.agencyId) {
        return NextResponse.json({ error: 'User not in your agency' }, { status: 404 });
    }
    if (target.email === me.email) {
        return NextResponse.json({ error: 'You cannot remove your own admin account' }, { status: 400 });
    }

    // Soft-detach: revert the user to a free-tier account, keep their User
    // row so they retain identity (name, sign-in history, etc.) and can
    // continue using the app on the free plan. Agency-pool counts live on
    // the Agency document, so this does not "give back" pooled quota the
    // user consumed while they were a member.
    const now = new Date();
    const previousRole = target.role;
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

    await logActivity({
        userEmail: me.email,
        agencyId: me.agencyId,
        action: ACTIONS.USER_DELETED,
        metadata: { target: email, mode: 'detached', previousRole },
    });
    return NextResponse.json({ success: true, mode: 'detached', email });
}
