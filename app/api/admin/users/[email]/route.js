import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { requireSuperAdmin } from '@/app/utils/authGuard';
import { logActivity } from '@/app/utils/activityLogger';
import { ACTIONS, SUPER_ADMIN_EMAIL } from '@/app/config/plans';

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

export async function DELETE(_req, { params }) {
    const guard = await requireSuperAdmin();
    if (guard.error) return guard.error;
    await connectDB();
    const email = decodeURIComponent((await params).email).toLowerCase();
    if (email === SUPER_ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 400 });
    }
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    await User.deleteOne({ email });
    await logActivity({
        userEmail: guard.user.email,
        agencyId: user.agencyId,
        action: ACTIONS.USER_DELETED,
        metadata: { target: email },
    });
    return NextResponse.json({ success: true });
}
