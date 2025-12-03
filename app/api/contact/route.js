import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/contact';
import { sendEmail } from '@/app/utils/sendMail';
import { generateContactEmails, generateAuditLimitRequestEmails } from '@/app/utils/contactEmailTemplate';

export async function POST(request) {
    try {
        await connectDB();
        const bodyData = await request.json();

        // Determine form type based on presence of fields
        const isAuditLimitRequest = bodyData.name && bodyData.message && !bodyData.firstName;
        const formType = isAuditLimitRequest ? 'audit_limit_request' : 'contact';

        let contactData;
        let emailConfigs;

        if (formType === 'audit_limit_request') {
            // Handle audit limit request (new form)
            contactData = {
                fullName: bodyData.name,
                email: bodyData.email,
                contact: bodyData.contact,
                message: bodyData.message,
                formType: 'audit_limit_request'
            };

            // Validate required fields
            if (!contactData.fullName || !contactData.email || !contactData.contact || !contactData.message) {
                return NextResponse.json({
                    success: false,
                    error: "Validation failed",
                    details: ["All fields are required"]
                }, { status: 400 });
            }

            // Create contact record
            const newContact = new Contact(contactData);
            await newContact.save();

            // Generate email configurations for audit limit request
            emailConfigs = generateAuditLimitRequestEmails(contactData);

            // Send emails - CORRECT parameter order: (to, subject, html, from)
            try {
                // Send internal notification email
                await sendEmail(
                    emailConfigs.internal.to,
                    emailConfigs.internal.subject,
                    emailConfigs.internal.html,
                    'support@analyticsliv.com'
                );

                // Send user confirmation email
                await sendEmail(
                    emailConfigs.user.to,
                    emailConfigs.user.subject,
                    emailConfigs.user.html,
                    'sales@analyticsliv.com'
                );

            } catch (emailError) {
                console.error('❌ Email sending error:', emailError);
                // Don't fail the request if email fails - contact is already saved
                return NextResponse.json({
                    success: true,
                    message: "Request submitted successfully, but confirmation email may be delayed",
                    warning: "Email delivery issue"
                }, { status: 200 });
            }

        } else {
            // Handle original contact form
            if (!bodyData.firstName || !bodyData.website) {
                return NextResponse.json({
                    success: false,
                    error: "Validation failed",
                    details: ["First name and website are required"]
                }, { status: 400 });
            }

            contactData = {
                firstName: bodyData.firstName,
                lastName: bodyData.lastName,
                email: bodyData.email,
                contact: bodyData.contact,
                website: bodyData.website,
                queries: bodyData.queries,
                formType: 'contact'
            };

            // Create contact record
            const newContact = new Contact(contactData);
            await newContact.save();

            // Generate email configurations for contact form
            emailConfigs = generateContactEmails(contactData);

            // Send emails - CORRECT parameter order: (to, subject, html, from)
            try {
                // Send internal notification email
                await sendEmail(
                    emailConfigs.internal.to,
                    emailConfigs.internal.subject,
                    emailConfigs.internal.html,
                    'support@analyticsliv.com'
                );

                // Send user confirmation email
                await sendEmail(
                    emailConfigs.user.to,
                    emailConfigs.user.subject,
                    emailConfigs.user.html,
                    'sales@analyticsliv.com'
                );
            } catch (emailError) {
                console.error('❌ Email sending error:', emailError);
                // Don't fail the request if email fails - contact is already saved
                return NextResponse.json({
                    success: true,
                    message: "Form submitted successfully, but confirmation email may be delayed",
                    warning: "Email delivery issue"
                }, { status: 200 });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Form submitted successfully"
        }, { status: 200 });

    } catch (error) {
        console.error('Contact form error:', error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json({
                success: false,
                error: "Validation failed",
                details: validationErrors
            }, { status: 400 });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                error: "Duplicate entry",
                details: ["This email has already been submitted recently"]
            }, { status: 409 });
        }

        return NextResponse.json({
            success: false,
            error: "Internal Server Error",
            details: ["Something went wrong. Please try again later."]
        }, { status: 500 });
    }
}