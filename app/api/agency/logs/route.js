import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ActivityLog from '@/models/activityLog';
import { getSessionUser } from '@/app/utils/authGuard';
import { ROLES } from '@/app/config/plans';

export async function GET(req) {
    const me = await getSessionUser();
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (me.role !== ROLES.AGENCY_ADMIN || !me.agencyId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter = { agencyId: me.agencyId };
    if (searchParams.get('action')) filter.action = searchParams.get('action');
    if (searchParams.get('userEmail')) filter.userEmail = searchParams.get('userEmail').toLowerCase();
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);
    const logs = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    return NextResponse.json({ success: true, logs });
}
