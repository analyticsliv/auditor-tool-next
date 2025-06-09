import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
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
        required: true,
        trim: true,
        validate: {
            validator: function (website) {
                return /^https?:\/\/.+/.test(website) || /^www\..+/.test(website) || /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/.test(website);
            },
            message: 'Please provide a valid website URL'
        }
    },
    queries: {
        type: String,
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
ContactSchema.index({ email: 1 });
ContactSchema.index({ timestamp: -1 });

// Add virtual for full name
ContactSchema.virtual('fullName').get(function () {
    return this.firstName + (this.lastName ? ' ' + this.lastName : '');
});

// Ensure virtual fields are serialized
ContactSchema.set('toJSON', { virtuals: true });

// Prevent re-compilation of model in development
const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

export default Contact;