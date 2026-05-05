import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const PropertySchema = new mongoose.Schema({
    propertyId: {
        type: String,
        required: true,
    },
    name: String,
    value: String,
}, { _id: false });

const AccountSchema = new mongoose.Schema({
    accountId: {
        type: String,
        required: true,
    },
    displayName: String,
    properties: [PropertySchema],
}, { _id: false });

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    name: {
        type: String,
        trim: true,
    },
    accounts: [AccountSchema],

    role: {
        type: String,
        enum: ['superadmin', 'agencyAdmin', 'agencyUser', 'freeUser'],
        default: 'freeUser',
        index: true,
    },
    agencyId: { type: String, default: null, index: true },
    status: {
        type: String,
        enum: ['active', 'pending', 'suspended'],
        default: 'active',
    },
    invitedBy: { type: String, default: null },

    auditCount: { type: Number, default: 0 },
    auditLimit: { type: Number, default: 3 },
    chatbotCount: { type: Number, default: 0 },
    chatbotLimit: { type: Number, default: 10 },

    auditLimitOverride: { type: Number, default: null },
    chatbotLimitOverride: { type: Number, default: null },

    quotaStartDate: { type: Date, default: Date.now },
    quotaResetDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },

    lastLogin: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Self-healing model registration: if a stale schema (missing the new
// role / agencyId / status fields) was cached by Mongoose during a previous
// dev hot-reload, drop it so the current schema is used.
const cachedUser = mongoose.models.User;
const cachedHasNewFields =
    cachedUser?.schema?.paths?.role &&
    cachedUser?.schema?.paths?.agencyId &&
    cachedUser?.schema?.paths?.chatbotLimit;

if (cachedUser && !cachedHasNewFields) {
    delete mongoose.models.User;
    if (mongoose.connection?.models?.User) delete mongoose.connection.models.User;
}

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
