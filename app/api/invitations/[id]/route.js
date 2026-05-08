import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invitation from '@/models/invitation';
import { getSessionUser } from '@/app/utils/authGuard';
import { logActivity } from '@/app/utils/activityLogger';
import { ROLES, SUPER_ADMIN_EMAIL, ACTIONS } from '@/app/config/plans';

export async function DELETE(_req, { params }) {
    const me = await getSessionUser();
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const inv = await Invitation.findById(id);
    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const isSuper = me.email === SUPER_ADMIN_EMAIL || me.role === ROLES.SUPER_ADMIN;
    if (!isSuper && inv.invitedBy !== me.email) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    inv.status = 'revoked';
    await inv.save();
    await logActivity({
        userEmail: me.email,
        agencyId: inv.agencyId,
        action: ACTIONS.INVITE_REVOKED,
        metadata: { invitee: inv.email },
    });
    return NextResponse.json({ success: true });
}
