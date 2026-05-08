import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ActivityLog from '@/models/activityLog';
import { requireSuperAdmin } from '@/app/utils/authGuard';

export async function GET(req) {
    const guard = await requireSuperAdmin();
    if (guard.error) return guard.error;
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter = {};
    const agencyId = searchParams.get('agencyId');
    const userEmail = searchParams.get('userEmail');
    const action = searchParams.get('action');
    if (agencyId) filter.agencyId = agencyId;
    if (userEmail) filter.userEmail = userEmail.toLowerCase();
    if (action) filter.action = action;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);
    const logs = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    return NextResponse.json({ success: true, logs });
}
