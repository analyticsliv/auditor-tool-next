import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import Agency from '@/models/agency';
import { PLANS, ROLES, SUPER_ADMIN_EMAIL, QUOTA_WINDOW_DAYS, addDays } from '@/app/config/plans';

function effectiveLimit(base, override) {
    return override !== null && override !== undefined ? override : base;
}

async function maybeResetUser(user) {
    const now = new Date();
    // Legacy users (created before this feature) have no quotaResetDate — initialize it.
    if (!user.quotaResetDate) {
        const newReset = addDays(now, QUOTA_WINDOW_DAYS);
        const updated = await User.findByIdAndUpdate(
            user._id,
            { quotaStartDate: now, quotaResetDate: newReset },
            { new: true }
        ).lean();
        return updated;
    }
    if (now < new Date(user.quotaResetDate)) return user;
    let newStart = new Date(user.quotaResetDate);
    while (addDays(newStart, QUOTA_WINDOW_DAYS) <= now) {
        newStart = addDays(newStart, QUOTA_WINDOW_DAYS);
    }
    const newReset = addDays(newStart, QUOTA_WINDOW_DAYS);
    const updated = await User.findByIdAndUpdate(
        user._id,
        { auditCount: 0, chatbotCount: 0, quotaStartDate: newStart, quotaResetDate: newReset },
        { new: true }
    ).lean();
    return updated;
}

async function maybeResetAgency(agency) {
    const now = new Date();
    if (!agency.quotaResetDate) {
        const newReset = addDays(now, QUOTA_WINDOW_DAYS);
        const updated = await Agency.findByIdAndUpdate(
            agency._id,
            { quotaStartDate: now, quotaResetDate: newReset },
            { new: true }
        ).lean();
        return updated;
    }
    if (now < new Date(agency.quotaResetDate)) return agency;
    let newStart = new Date(agency.quotaResetDate);
    while (addDays(newStart, QUOTA_WINDOW_DAYS) <= now) {
        newStart = addDays(newStart, QUOTA_WINDOW_DAYS);
    }
    const newReset = addDays(newStart, QUOTA_WINDOW_DAYS);
    const updated = await Agency.findByIdAndUpdate(
        agency._id,
        { auditCount: 0, chatbotCount: 0, quotaStartDate: newStart, quotaResetDate: newReset },
        { new: true }
    ).lean();
    return updated;
}

function buildBucket(used, limit) {
    const remaining = Math.max(0, limit - used);
    return { used, limit, remaining, blocked: used >= limit };
}

export async function resolveQuota(email) {
    if (!email) return null;
    await connectDB();
    const normalized = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalized });
    if (!user) return null;

    if (user.email === SUPER_ADMIN_EMAIL || user.role === ROLES.SUPER_ADMIN) {
        return {
            role: ROLES.SUPER_ADMIN,
            plan: 'unlimited',
            scope: 'unlimited',
            audit:   { used: 0, limit: Infinity, remaining: Infinity, blocked: false },
            chatbot: { used: 0, limit: Infinity, remaining: Infinity, blocked: false },
            resetDate: null,
            agencyId: null,
            email: user.email,
        };
    }

    if (user.agencyId) {
        let agency = await Agency.findOne({ agencyId: user.agencyId });
        if (!agency) {
            return {
                role: user.role,
                plan: 'free',
                scope: 'user',
                audit: buildBucket(0, 0),
                chatbot: buildBucket(0, 0),
                resetDate: null,
                agencyId: user.agencyId,
                email: user.email,
                error: 'Agency not found',
            };
        }
        agency = await maybeResetAgency(agency.toObject ? agency.toObject() : agency);
        const auditLimit = effectiveLimit(agency.auditLimit, agency.auditLimitOverride);
        const chatLimit = effectiveLimit(agency.chatbotLimit, agency.chatbotLimitOverride);
        return {
            role: user.role,
            plan: agency.plan,
            scope: 'agency',
            audit: buildBucket(agency.auditCount, auditLimit),
            chatbot: buildBucket(agency.chatbotCount, chatLimit),
            resetDate: agency.quotaResetDate,
            agencyId: agency.agencyId,
            agencyName: agency.name,
            email: user.email,
        };
    }

    user = await maybeResetUser(user.toObject ? user.toObject() : user);
    const auditLimit = effectiveLimit(user.auditLimit ?? PLANS.free.auditLimit, user.auditLimitOverride);
    const chatLimit = effectiveLimit(user.chatbotLimit ?? PLANS.free.chatbotLimit, user.chatbotLimitOverride);
    return {
        role: user.role || ROLES.FREE_USER,
        plan: 'free',
        scope: 'user',
        audit: buildBucket(user.auditCount ?? 0, auditLimit),
        chatbot: buildBucket(user.chatbotCount ?? 0, chatLimit),
        resetDate: user.quotaResetDate,
        agencyId: null,
        email: user.email,
    };
}

export async function incrementUsage(email, type) {
    if (!['audit', 'chatbot'].includes(type)) throw new Error('invalid type');
    const quota = await resolveQuota(email);
    if (!quota) return { ok: false, status: 404, message: 'User not found' };
    if (quota.scope === 'unlimited') return { ok: true, quota };

    const bucket = type === 'audit' ? quota.audit : quota.chatbot;
    if (bucket.blocked) {
        return { ok: false, status: 403, message: `${type} limit reached`, quota };
    }

    const field = type === 'audit' ? 'auditCount' : 'chatbotCount';
    if (quota.scope === 'agency') {
        await Agency.updateOne({ agencyId: quota.agencyId }, { $inc: { [field]: 1 } });
    } else {
        await User.updateOne({ email: quota.email }, { $inc: { [field]: 1 } });
    }
    const fresh = await resolveQuota(email);
    return { ok: true, quota: fresh };
}
