import mongoose from 'mongoose';
import crypto from 'crypto';

const InvitationSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    agencyId: { type: String, default: null },
    role: { type: String, enum: ['agencyAdmin', 'agencyUser'], required: true },
    invitedBy: { type: String, required: true },
    token: {
        type: String,
        required: true,
        unique: true,
        default: () => crypto.randomBytes(32).toString('hex'),
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired', 'revoked'],
        default: 'pending',
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
}, { timestamps: true });

const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', InvitationSchema);

export default Invitation;
