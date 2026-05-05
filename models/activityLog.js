import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
    userEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    agencyId: { type: String, default: null, index: true },
    action: { type: String, required: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: true, updatedAt: false } });

ActivityLogSchema.index({ agencyId: 1, createdAt: -1 });
ActivityLogSchema.index({ userEmail: 1, createdAt: -1 });

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);

export default ActivityLog;
