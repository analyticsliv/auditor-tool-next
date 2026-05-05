import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const AgencySchema = new mongoose.Schema({
    agencyId: {
        type: String,
        default: uuidv4,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    plan: {
        type: String,
        enum: ['pro', 'premium'],
        required: true,
    },
    seatLimit: { type: Number, required: true },

    auditCount: { type: Number, default: 0 },
    auditLimit: { type: Number, required: true },
    chatbotCount: { type: Number, default: 0 },
    chatbotLimit: { type: Number, required: true },

    auditLimitOverride: { type: Number, default: null },
    chatbotLimitOverride: { type: Number, default: null },

    quotaStartDate: { type: Date, default: Date.now },
    quotaResetDate: { type: Date, required: true },

    createdBy: { type: String, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Agency = mongoose.models.Agency || mongoose.model('Agency', AgencySchema);

export default Agency;
