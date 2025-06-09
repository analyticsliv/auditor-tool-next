// app/utils/contactEmailTemplates.js

import { generateEmailTemplate } from "./genrateTemplate";


export function generateInternalContactEmail(contactData, internalEmails = null) {
    const subject = 'New query of Auditor tool';
    
    // Default internal emails - you can modify this list
    const defaultInternalEmails = [
        "atul.verma@analyticsliv.com",
        // Add more default emails here as needed
        // "sales@analyticsliv.com",
        // "support@analyticsliv.com",
        // "manager@analyticsliv.com"
    ];
    
    // Use provided emails or fall back to defaults
    const recipientEmails = internalEmails || defaultInternalEmails;
    
    const html = `
        <p><strong>New Contact Form Submission</strong></p>
        
        <div class="info-box">
            <h3>📝 Contact Details</h3>
            <p><strong>Name:</strong> ${contactData.firstName} ${contactData.lastName || ''}</p>
            <p><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
            <p><strong>Contact:</strong> ${contactData.contact}</p>
            <p><strong>Website:</strong> ${contactData.website || 'Not provided'}</p>
        </div>
        
        <div class="summary-card">
            <h3>💬 Query Details</h3>
            <p><strong>Message:</strong></p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 10px;">
                ${contactData.queries}
            </div>
        </div>
        
        <div class="info-box">
            <h4>📊 Lead Information</h4>
            <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Source:</strong> GA4 Auditor Tool Contact Form</p>
            <p><strong>Priority:</strong> ${contactData.website ? 'High (Has Website)' : 'Medium'}</p>
        </div>
        
        <div class="warning-box">
            <h4>⏰ Follow-up Required</h4>
            <p>Please respond to this inquiry within 24 hours for optimal customer experience.</p>
        </div>
        
        <div class="cta-section">
            <h3>Quick Actions</h3>
            <a href="mailto:${contactData.email}?subject=Re: Your GA4 Auditor Tool Inquiry" class="button">Reply to Customer</a>
        </div>
        
        <div style="margin-top: 20px; font-size: 12px; color: #666;">
            <p><strong>Internal Distribution:</strong> ${recipientEmails.join(', ')}</p>
        </div>
    `;
    
    const emailHtml = generateEmailTemplate(subject, html);
    
    return {
        to: recipientEmails,
        subject: subject,
        html: emailHtml
    };
}


export function generateUserConfirmationEmail(contactData) {
    const subject = 'Analyticsliv - Thank you for contacting us.';
    
    const html = `
        <p>Hi ${contactData.firstName},</p>
        
        <div class="success-box">
            <h3>✅ Thank You for Your Interest!</h3>
            <p>We've successfully received your inquiry about our GA4 Auditor Tool. Our team is reviewing your requirements and will get back to you shortly.</p>
        </div>
        
        <div class="summary-card">
            <h3>📋 Your Submission Summary</h3>
            <p><strong>Name:</strong> ${contactData.firstName} ${contactData.lastName || ''}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Contact:</strong> ${contactData.contact}</p>
            ${contactData.website ? `<p><strong>Website:</strong> ${contactData.website}</p>` : ''}
            <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="info-box">
            <h4>🕒 What's Next?</h4>
            <ul>
                <li><strong>Response Time:</strong> You'll hear from us within 24 hours</li>
                <li><strong>Expert Consultation:</strong> Our GA4 specialists will review your specific needs</li>
                <li><strong>Custom Solution:</strong> We'll provide tailored recommendations for your analytics setup</li>
            </ul>
        </div>
        
        <div class="summary-card">
            <h3>🚀 Explore Our Services</h3>
            <p>While you wait, discover more about how AnalyticsLiv can help optimize your digital analytics:</p>
            <ul>
                <li><strong>GA4 Migration:</strong> Seamless transition from Universal Analytics</li>
                <li><strong>Custom Dashboards:</strong> Real-time insights for your business</li>
                <li><strong>Training & Support:</strong> Empower your team with analytics expertise</li>
                <li><strong>Compliance Audits:</strong> Ensure data accuracy and privacy compliance</li>
            </ul>
        </div>
        
        <div class="cta-section">
            <h3>Need Immediate Assistance?</h3>
            <p>For urgent inquiries, feel free to reach out to us directly:</p>
            <div style="margin: 15px 0;">
                <a href="tel:+918320576622" class="button">📞 Call Us: +91 83205 76622</a>
            </div>
            <div style="margin: 15px 0;">
                <a href="mailto:support@analyticsliv.com" class="button">✉️ Email Support</a>
            </div>
            <div style="margin: 15px 0;">
                <a href="https://analyticsliv.com" class="button">🌐 Visit Our Website</a>
            </div>
        </div>
        
        <div class="info-box">
            <h4>💡 Pro Tip</h4>
            <p>Follow us on social media for the latest updates on GA4 best practices and digital analytics trends!</p>
        </div>
        
        <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The AnalyticsLiv Team</strong><br>
            <em>Your Partner in Digital Analytics Excellence</em>
        </p>
    `;
    
    const emailHtml = generateEmailTemplate(subject, html);
    
    return {
        to: [contactData.email],
        subject: subject,
        html: emailHtml
    };
}


export function generateContactEmails(contactData, internalEmails = null) {
    return {
        internal: generateInternalContactEmail(contactData, internalEmails),
        user: generateUserConfirmationEmail(contactData)
    };
}