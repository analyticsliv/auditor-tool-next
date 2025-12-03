import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    fullName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: 'Please provide a valid email address'
        }
    },
    contact: {
        type: String,
        required: true,
        trim: true,
    },
    website: {
        type: String,
        trim: true,
        validate: {
            validator: function (website) {
                if (!website) return true;
                return /^https?:\/\/.+/.test(website) || /^www\..+/.test(website) || /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/.test(website);
            },
            message: 'Please provide a valid website URL'
        }
    },
    queries: {
        type: String,
        trim: true,
    },
    message: {
        type: String,
        trim: true,
    },
    formType: {
        type: String,
        enum: ['contact', 'audit_limit_request'],
        default: 'contact'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
ContactSchema.index({ email: 1 });
ContactSchema.index({ timestamp: -1 });
ContactSchema.index({ formType: 1 });

// Add virtual for full name if firstName/lastName exist
ContactSchema.virtual('computedFullName').get(function () {
    if (this.fullName) return this.fullName;
    return this.firstName + (this.lastName ? ' ' + this.lastName : '');
});

// Ensure virtual fields are serialized
ContactSchema.set('toJSON', { virtuals: true });

const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

export default Contact;