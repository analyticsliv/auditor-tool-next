import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/contact';
import { sendEmail } from '@/app/utils/sendMail';

export async function POST(request) {
    try {
        await connectDB();
        const bodyData = await request.json();

        // Create new contact record - let the model handle validation
        const newContact = new Contact({
            firstName: bodyData.firstName,
            lastName: bodyData.lastName,
            email: bodyData.email,
            contact: bodyData.contact,
            website: bodyData.website,
            queries: bodyData.queries
        });

        await newContact.save();

        // Internal email configuration
        const internalMailOptions = {
            to: ["atul.verma@analyticsliv.com"],
            subject: 'New query of Auditor tool',
            html: `Enquiry Submitted by <br> Name - ${bodyData.firstName} ${bodyData.lastName || ''} <br> Email- ${bodyData.email} <br> Contact - ${bodyData.contact} <br> Website - ${bodyData.website || 'Not provided'} <br> Query- ${bodyData.queries}`
        };

        // User confirmation email configuration
        const userMailOptions = {
            to: [bodyData.email],
            subject: 'Analyticsliv - Thank you for contacting us.',
            html: `Hi ${bodyData.firstName},<br>
                Thank you for submitting your query on the Auditor Tool at AnalyticsLiv. We've received your details and our team is reviewing them.<br>
                We will connect with you shortly to assist you. In the meantime, feel free to explore more about our services on <a href="https://analyticsliv.com">www.analyticsliv.com</a>.<br>
                For immediate assistance, you can reach us at:<br>
                Mobile: <a href="tel:+918320576622">+91 83205 76622</a><br>
                Email: <a href="mailto:support@analyticsliv.com">support@analyticsliv.com</a><br><br>
                Best regards,<br>
                The AnalyticsLiv Team`
        };

        // Send emails
        await sendEmail(internalMailOptions.to, internalMailOptions.subject, internalMailOptions.html, 'support@analyticsliv.com');
        await sendEmail(userMailOptions.to, userMailOptions.subject, userMailOptions.html, 'sales@analyticsliv.com');

        return NextResponse.json({ message: "Form submitted successfully" }, { status: 200 });

    } catch (error) {
        console.error('Contact form error:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json({ 
                error: "Validation failed", 
                details: validationErrors 
            }, { status: 400 });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return NextResponse.json({ 
                error: "Duplicate entry", 
                details: ["This email has already been submitted"] 
            }, { status: 409 });
        }

        // Handle email sending errors
        if (error.message && error.message.includes('email')) {
            return NextResponse.json({ 
                error: "Email delivery failed", 
                details: ["Form submitted but confirmation email couldn't be sent"] 
            }, { status: 207 }); // 207 Multi-Status - partial success
        }

        return NextResponse.json({ 
            error: "Internal Server Error",
            details: ["Something went wrong. Please try again later."]
        }, { status: 500 });
    }
}