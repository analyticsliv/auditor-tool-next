import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import Agency from '@/models/agency';
import Invitation from '@/models/invitation';
import { requireSuperAdmin } from '@/app/utils/authGuard';

export async function GET(req) {
    const guard = await requireSuperAdmin();
    if (guard.error) return guard.error;
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter = {};
    const role = searchParams.get('role');
    const agencyId = searchParams.get('agencyId');
    if (role) filter.role = role;
    if (agencyId) filter.agencyId = agencyId;

    const users = await User.find(filter)
        .select('-accounts')
        .sort({ createdAt: -1 })
        .lean();

    const agencyIds = [...new Set(users.map(u => u.agencyId).filter(Boolean))];
    const agencies = await Agency.find({ agencyId: { $in: agencyIds } })
        .select('agencyId name plan auditCount auditLimit chatbotCount chatbotLimit auditLimitOverride chatbotLimitOverride')
        .lean();
    const agencyMap = Object.fromEntries(agencies.map(a => [a.agencyId, a]));

    const enriched = users.map(u => ({
        ...u,
        agency: u.agencyId ? agencyMap[u.agencyId] || null : null,
        invitationStatus: 'accepted',
    }));

    return NextResponse.json({ success: true, users: enriched });
}
