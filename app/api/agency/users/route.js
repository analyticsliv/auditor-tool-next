import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import Agency from '@/models/agency';
import Invitation from '@/models/invitation';
import { getSessionUser } from '@/app/utils/authGuard';
import { ROLES } from '@/app/config/plans';

export async function GET() {
    const me = await getSessionUser();
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (me.role !== ROLES.AGENCY_ADMIN || !me.agencyId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const [agency, users, invites] = await Promise.all([
        Agency.findOne({ agencyId: me.agencyId }).lean(),
        User.find({ agencyId: me.agencyId })
            .select('email name role status lastLogin createdAt')
            .sort({ createdAt: -1 })
            .lean(),
        Invitation.find({ agencyId: me.agencyId }).sort({ createdAt: -1 }).lean(),
    ]);
    const enriched = users.map(u => ({ ...u, invitationStatus: 'accepted' }));
    const pendingInvites = invites
        .filter(i => !users.find(u => u.email === i.email))
        .map(i => ({
            _id: `inv_${i._id}`,
            email: i.email,
            role: i.role,
            invitationStatus: i.status,
            invitationId: i._id,
            invitedBy: i.invitedBy,
            invitedAt: i.createdAt,
            expiresAt: i.expiresAt,
        }));
    return NextResponse.json({ success: true, agency, users: enriched, pendingInvites });
}
