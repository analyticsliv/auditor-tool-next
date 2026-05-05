import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { getSessionUser } from '@/app/utils/authGuard';
import { logActivity } from '@/app/utils/activityLogger';
import { ROLES, ACTIONS } from '@/app/config/plans';

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
        return NextResponse.json({ error: 'You cannot delete your own admin account' }, { status: 400 });
    }
    await User.deleteOne({ email });
    await logActivity({
        userEmail: me.email,
        agencyId: me.agencyId,
        action: ACTIONS.USER_DELETED,
        metadata: { target: email },
    });
    return NextResponse.json({ success: true });
}
