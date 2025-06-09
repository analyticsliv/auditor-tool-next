import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/contact';
import { sendEmail } from '@/app/utils/sendMail';
import { generateContactEmails } from '@/app/utils/contactEmailTemplate'; // Add this import

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

        // Generate email configurations using the new utility functions
        const emailConfigs = generateContactEmails(bodyData);

        // Send emails using the generated configurations
        await sendEmail(
            emailConfigs.internal.to, 
            emailConfigs.internal.subject, 
            emailConfigs.internal.html, 
            'support@analyticsliv.com'
        );
        
        await sendEmail(
            emailConfigs.user.to, 
            emailConfigs.user.subject, 
            emailConfigs.user.html, 
            'sales@analyticsliv.com'
        );

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