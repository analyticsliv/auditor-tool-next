import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invitation from '@/models/invitation';
import User from '@/models/user';
import Agency from '@/models/agency';
import { getSessionUser } from '@/app/utils/authGuard';
import { logActivity } from '@/app/utils/activityLogger';
import { ACTIONS } from '@/app/config/plans';

export async function POST(req) {
    try {
        const me = await getSessionUser();
        if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await connectDB();
        const { token } = await req.json();
        if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

        const inv = await Invitation.findOne({ token });
        if (!inv) return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
        if (inv.status !== 'pending') return NextResponse.json({ error: `Invitation ${inv.status}` }, { status: 400 });
        if (new Date() > new Date(inv.expiresAt)) {
            inv.status = 'expired';
            await inv.save();
            return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
        }
        if (inv.email !== me.email) {
            return NextResponse.json({ error: 'This invitation is for a different account' }, { status: 403 });
        }

        const agency = await Agency.findOne({ agencyId: inv.agencyId });
        if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 });

        const seatsUsed = await User.countDocuments({ agencyId: agency.agencyId });
        if (seatsUsed >= agency.seatLimit && me.agencyId !== agency.agencyId) {
            return NextResponse.json({ error: 'Agency seat limit reached' }, { status: 400 });
        }

        await User.updateOne(
            { email: me.email },
            { $set: { agencyId: agency.agencyId, role: inv.role, invitedBy: inv.invitedBy, status: 'active' } }
        );

        inv.status = 'accepted';
        await inv.save();

        await logActivity({
            userEmail: me.email,
            agencyId: agency.agencyId,
            action: ACTIONS.INVITE_ACCEPTED,
            metadata: { role: inv.role, invitedBy: inv.invitedBy },
        });

        return NextResponse.json({ success: true, agencyId: agency.agencyId, role: inv.role });
    } catch (err) {
        console.error('invite accept error', err);
        return NextResponse.json({ error: err?.message || 'Failed to accept invitation' }, { status: 500 });
    }
}

export async function GET(req) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });
    const inv = await Invitation.findOne({ token }).lean();
    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const agency = await Agency.findOne({ agencyId: inv.agencyId }).select('name plan').lean();
    return NextResponse.json({
        success: true,
        invitation: { email: inv.email, role: inv.role, status: inv.status, expiresAt: inv.expiresAt },
        agency,
    });
}
