import ActivityLog from '@/models/activityLog';

export async function logActivity({ userEmail, agencyId = null, action, metadata = {} }) {
    try {
        await ActivityLog.create({
            userEmail: (userEmail || '').toLowerCase().trim(),
            agencyId: agencyId || null,
            action,
            metadata,
        });
    } catch (err) {
        console.error('activityLogger error:', err);
    }
}
