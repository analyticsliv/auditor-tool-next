import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Property Schema (nested within Account)
const PropertySchema = new mongoose.Schema({
    propertyId: {
        type: String,
        required: true,
        unique: true,
    },
    name: String,
    value: String,
}, { _id: false }); // Disable _id for subdocuments

// Account Schema (nested within User)
const AccountSchema = new mongoose.Schema({
    accountId: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: String,
    properties: [PropertySchema], // Array of Property subdocuments
}, { _id: false }); // Disable _id for subdocuments

// Main User Schema
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
    auditCount: {
        type: Number,
        default: 0,
    },
    auditLimit: {
        type: Number,
        default: 5,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true }); // This automatically adds createdAt and updatedAt fields

// Prevent re-compilation of model in development
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;