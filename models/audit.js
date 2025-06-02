import mongoose from 'mongoose';

const AuditSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    accountId: {
        type: String,
        required: true,
    },
    propertyId: {
        type: String,
        required: true,
    },
    accountName: {
        type: String,
    },
    propertyName: {
        type: String,
    },
    auditData: {
        type: Object,
        required: true
    },
    endApiData: {
        type: Object,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Update the updatedAt field before saving
AuditSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Prevent re-compilation of model in development
const Audit = mongoose.models.Audit || mongoose.model('Audit', AuditSchema);

export default Audit;