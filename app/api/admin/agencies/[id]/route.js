import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agency from '@/models/agency';
import User from '@/models/user';
import { requireSuperAdmin } from '@/app/utils/authGuard';
import { logActivity } from '@/app/utils/activityLogger';
import { PLANS, ACTIONS, QUOTA_WINDOW_DAYS, addDays, ROLES } from '@/app/config/plans';

export async function GET(_req, { params }) {
    const guard = await requireSuperAdmin();
    if (guard.error) return guard.error;
    await connectDB();
    const { id } = await params;
    const agency = await Agency.findOne({ agencyId: id }).lean();
    if (!agency) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const users = await User.find({ agencyId: id }).select('email name role status createdAt lastLogin').lean();
    return NextResponse.json({ success: true, agency, users });
}

export async function PATCH(req, { params }) {
    const guard = await requireSuperAdmin();
    if (guard.error) return guard.error;
    try {
        await connectDB();
        const body = await req.json();
        const { id } = await params;
        const agency = await Agency.findOne({ agencyId: id });
        if (!agency) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const changes = {};
        if (body.name) { changes.name = body.name.trim(); agency.name = changes.name; }
        if (body.plan && ['pro', 'premium'].includes(body.plan) && body.plan !== agency.plan) {
            const old = agency.plan;
            const def = PLANS[body.plan];
            agency.plan = body.plan;
            agency.seatLimit = def.seatLimit;
            agency.auditLimit = def.auditLimit;
            agency.chatbotLimit = def.chatbotLimit;
            changes.plan = { from: old, to: body.plan };
        }
        if (body.auditLimitOverride !== undefined) agency.auditLimitOverride = body.auditLimitOverride;
        if (body.chatbotLimitOverride !== undefined) agency.chatbotLimitOverride = body.chatbotLimitOverride;
        if (body.seatLimit !== undefined) agency.seatLimit = body.seatLimit;
        if (body.isActive !== undefined) agency.isActive = body.isActive;
        if (body.resetCounts) { agency.auditCount = 0; agency.chatbotCount = 0; }

        await agency.save();

        if (changes.plan) {
            await logActivity({
                userEmail: guard.user.email,
                agencyId: agency.agencyId,
                action: ACTIONS.PLAN_CHANGED,
                metadata: changes.plan,
            });
        }
        if (body.auditLimitOverride !== undefined || body.chatbotLimitOverride !== undefined) {
            await logActivity({
                userEmail: guard.user.email,
                agencyId: agency.agencyId,
                action: ACTIONS.LIMIT_OVERRIDDEN,
                metadata: {
                    auditLimitOverride: agency.auditLimitOverride,
                    chatbotLimitOverride: agency.chatbotLimitOverride,
                },
            });
        }
        return NextResponse.json({ success: true, agency });
    } catch (err) {
        console.error('agency patch error', err);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(_req, { params }) {
    const guard = await requireSuperAdmin();
    if (guard.error) return guard.error;
    await connectDB();
    const { id } = await params;
    const agency = await Agency.findOne({ agencyId: id });
    if (!agency) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await Agency.deleteOne({ agencyId: id });
    // Detach users (do not delete users themselves; they fall back to free).
    // Reset every personal field to free-tier defaults so the next quota
    // resolution doesn't keep the agency's old limits/counts/overrides.
    const now = new Date();
    await User.updateMany(
        { agencyId: id },
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
        userEmail: guard.user.email,
        agencyId: id,
        action: ACTIONS.AGENCY_DELETED,
        metadata: { name: agency.name },
    });
    return NextResponse.json({ success: true });
}
