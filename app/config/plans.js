export const SUPER_ADMIN_EMAIL = 'data.analytics@analyticsliv.com';

export const PLANS = {
    free: {
        key: 'free',
        label: 'Free',
        auditLimit: 3,
        chatbotLimit: 10,
        seatLimit: 1,
        scope: 'user',
    },
    pro: {
        key: 'pro',
        label: 'Pro',
        auditLimit: 30,
        chatbotLimit: 50,
        seatLimit: 5,
        scope: 'agency',
    },
    premium: {
        key: 'premium',
        label: 'Premium',
        auditLimit: 50,
        chatbotLimit: 75,
        seatLimit: 15,
        scope: 'agency',
    },
};

export const QUOTA_WINDOW_DAYS = 30;

export const ROLES = {
    SUPER_ADMIN: 'superadmin',
    AGENCY_ADMIN: 'agencyAdmin',
    AGENCY_USER: 'agencyUser',
    FREE_USER: 'freeUser',
};

export const ACTIONS = {
    AUDIT_RUN: 'audit_run',
    CHATBOT_MESSAGE: 'chatbot_message',
    LOGIN: 'login',
    USER_INVITED: 'user_invited',
    INVITE_ACCEPTED: 'invite_accepted',
    INVITE_REVOKED: 'invite_revoked',
    PLAN_CHANGED: 'plan_changed',
    LIMIT_OVERRIDDEN: 'limit_overridden',
    USER_DELETED: 'user_deleted',
    AGENCY_CREATED: 'agency_created',
    AGENCY_DELETED: 'agency_deleted',
    ADMIN_ASSIGNED: 'admin_assigned',
};

export function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
