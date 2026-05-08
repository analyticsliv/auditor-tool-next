import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { resolveQuota, incrementUsage } from '@/app/utils/quotaUtils';
import { logActivity } from '@/app/utils/activityLogger';
import { ACTIONS } from '@/app/config/plans';

function shape(quota) {
    const a = quota.audit;
    const limit = a.limit === Infinity ? null : a.limit;
    const used = a.used ?? 0;
    return {
        auditCount: used,
        auditLimit: limit,
        hasReachedLimit: a.blocked,
        remainingAudits: a.remaining === Infinity ? null : Math.max(0, a.remaining ?? 0),
        scope: quota.scope,
        plan: quota.plan,
    };
}

async function handle(action, email, metadata) {
    if (!email) {
        return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }
    await connectDB();

    if (action === 'check') {
        const quota = await resolveQuota(email);
        if (!quota) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        return NextResponse.json({ success: true, action: 'check', ...shape(quota) });
    }

    if (action === 'increment') {
        const result = await incrementUsage(email, 'audit');
        if (!result.ok) {
            return NextResponse.json(
                { success: false, message: result.message, ...(result.quota ? shape(result.quota) : {}) },
                { status: result.status || 500 }
            );
        }
        await logActivity({
            userEmail: email,
            agencyId: result.quota.agencyId,
            action: ACTIONS.AUDIT_RUN,
            metadata: metadata || {},
        });
        return NextResponse.json({
            success: true,
            action: 'increment',
            message: 'Audit count incremented successfully',
            ...shape(result.quota),
        });
    }

    return NextResponse.json(
        { success: false, message: 'Invalid action. Must be "check" or "increment"' },
        { status: 400 }
    );
}

export async function POST(req) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');
        const body = await req.json();
        return await handle(action, body.email, body.metadata);
    } catch (error) {
        console.error('Error in audit count management:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');
        return await handle('check', email);
    } catch (error) {
        console.error('Error checking audit count:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
