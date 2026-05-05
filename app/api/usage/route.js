import { NextResponse } from 'next/server';
import { resolveQuota } from '@/app/utils/quotaUtils';
import { requireAuthenticated } from '@/app/utils/authGuard';

export async function GET() {
    const guard = await requireAuthenticated();
    if (guard.error) return guard.error;

    const quota = await resolveQuota(guard.user.email);
    if (!quota) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Replace Infinity (non-JSON-serializable) with null + flag
    const audit = quota.audit.limit === Infinity
        ? { used: 0, limit: null, remaining: null, blocked: false, unlimited: true }
        : quota.audit;
    const chatbot = quota.chatbot.limit === Infinity
        ? { used: 0, limit: null, remaining: null, blocked: false, unlimited: true }
        : quota.chatbot;

    return NextResponse.json({
        success: true,
        email: quota.email,
        role: quota.role,
        plan: quota.plan,
        scope: quota.scope,
        agencyId: quota.agencyId,
        agencyName: quota.agencyName || null,
        audit,
        chatbot,
        resetDate: quota.resetDate,
    });
}
