import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { resolveQuota, incrementUsage } from '@/app/utils/quotaUtils';
import { logActivity } from '@/app/utils/activityLogger';
import { ACTIONS } from '@/app/config/plans';
import { requireAuthenticated } from '@/app/utils/authGuard';

function shape(quota) {
    const c = quota.chatbot;
    const limit = c.limit === Infinity ? null : c.limit;
    const used = c.used ?? 0;
    return {
        chatbotCount: used,
        chatbotLimit: limit,
        hasReachedLimit: c.blocked,
        remainingMessages: c.remaining === Infinity ? null : Math.max(0, c.remaining ?? 0),
        scope: quota.scope,
        plan: quota.plan,
    };
}

async function handle(action, email, metadata) {
    await connectDB();

    if (action === 'check') {
        const quota = await resolveQuota(email);
        if (!quota) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        return NextResponse.json({ success: true, action: 'check', ...shape(quota) });
    }

    if (action === 'increment') {
        const result = await incrementUsage(email, 'chatbot');
        if (!result.ok) {
            return NextResponse.json(
                { success: false, message: result.message, ...(result.quota ? shape(result.quota) : {}) },
                { status: result.status || 500 }
            );
        }
        await logActivity({
            userEmail: email,
            agencyId: result.quota.agencyId,
            action: ACTIONS.CHATBOT_MESSAGE,
            metadata: metadata || {},
        });
        return NextResponse.json({
            success: true,
            action: 'increment',
            message: 'Chatbot count incremented successfully',
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
        // Email is derived from the authenticated session — never trust the body.
        const guard = await requireAuthenticated();
        if (guard.error) return guard.error;
        const email = guard.user.email;

        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');
        const body = await req.json().catch(() => ({}));
        return await handle(action, email, body?.metadata);
    } catch (error) {
        console.error('Error in chatbot count management:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const guard = await requireAuthenticated();
        if (guard.error) return guard.error;
        return await handle('check', guard.user.email);
    } catch (error) {
        console.error('Error checking chatbot count:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
