import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invitation from '@/models/invitation';
import Agency from '@/models/agency';
import User from '@/models/user';
import { getSessionUser } from '@/app/utils/authGuard';
import { logActivity } from '@/app/utils/activityLogger';
import { sendEmail } from '@/app/utils/sendMail';
import { generateInvitationEmail } from '@/app/utils/invitationEmailTemplate';
import { ROLES, SUPER_ADMIN_EMAIL, ACTIONS } from '@/app/config/plans';

export async function POST(req) {
    const me = await getSessionUser();
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await connectDB();
        const body = await req.json();
        const email = (body.email || '').toLowerCase().trim();
        const role = body.role; // 'agencyAdmin' | 'agencyUser'
        let agencyId = body.agencyId || null;

        if (!email || !role || !['agencyAdmin', 'agencyUser'].includes(role)) {
            return NextResponse.json({ error: 'email and role required' }, { status: 400 });
        }

        const isSuper = me.email === SUPER_ADMIN_EMAIL || me.role === ROLES.SUPER_ADMIN;
        const isAgencyAdmin = me.role === ROLES.AGENCY_ADMIN;

        if (role === 'agencyAdmin' && !isSuper) {
            return NextResponse.json({ error: 'Only super admin can invite agency admins' }, { status: 403 });
        }
        if (role === 'agencyUser') {
            if (!isSuper && !isAgencyAdmin) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            if (isAgencyAdmin) agencyId = me.agencyId;
        }
        if (role === 'agencyAdmin' && !agencyId) {
            return NextResponse.json({ error: 'agencyId required for agencyAdmin invite' }, { status: 400 });
        }

        const agency = await Agency.findOne({ agencyId });
        if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 });

        const seatsUsed = await User.countDocuments({ agencyId });
        const pendingInvites = await Invitation.countDocuments({ agencyId, status: 'pending' });
        if (seatsUsed + pendingInvites >= agency.seatLimit) {
            return NextResponse.json({ error: `Seat limit (${agency.seatLimit}) reached for this agency` }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser?.agencyId && existingUser.agencyId !== agencyId) {
            return NextResponse.json({ error: 'User already belongs to another agency' }, { status: 400 });
        }

        await Invitation.updateMany(
            { email, agencyId, status: 'pending' },
            { $set: { status: 'revoked' } }
        );

        const invitation = await Invitation.create({
            email, agencyId, role, invitedBy: me.email,
        });

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const acceptUrl = `${baseUrl}/invite/${invitation.token}`;
        const mail = generateInvitationEmail({
            email,
            inviterEmail: me.email,
            agencyName: agency.name,
            role,
            acceptUrl,
            expiresAt: invitation.expiresAt,
        });

        try {
            await sendEmail(mail.to, mail.subject, mail.html, 'support@analyticsliv.com');
        } catch (e) {
            console.error('Invite email failed:', e);
        }

        await logActivity({
            userEmail: me.email,
            agencyId,
            action: ACTIONS.USER_INVITED,
            metadata: { invitee: email, role },
        });

        return NextResponse.json({ success: true, invitation, acceptUrl }, { status: 201 });
    } catch (err) {
        console.error('invitation create error', err);
        return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }
}

export async function GET(req) {
    const me = await getSessionUser();
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const isSuper = me.email === SUPER_ADMIN_EMAIL || me.role === ROLES.SUPER_ADMIN;
    const filter = {};
    if (!isSuper) {
        if (me.role !== ROLES.AGENCY_ADMIN) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        filter.agencyId = me.agencyId;
    } else if (searchParams.get('agencyId')) {
        filter.agencyId = searchParams.get('agencyId');
    }
    if (searchParams.get('status')) filter.status = searchParams.get('status');
    const invitations = await Invitation.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, invitations });
}
