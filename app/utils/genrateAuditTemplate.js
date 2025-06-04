import { generateEmailTemplate } from "./genrateTemplate";
import { sendEmail } from "./sendMail";


export function generateSimpleAuditEmail(auditData) {
    const {
        userName,
        userEmail,
        propertyName,
        auditUrl
    } = auditData;

    const subject = `🔍 Your GA4 Audit Report is Ready - ${propertyName}`;

    const html = `
        <p>Hi ${userName},</p>
        
        <div class="success-box">
            <h3>✅ Your GA4 Audit Report is Ready!</h3>
            <p>We've successfully completed the audit for your Google Analytics 4 property "<strong>${propertyName}</strong>".</p>
        </div>
        
        <div class="cta-section">
            <h3>View Your Audit Report</h3>
            <p>Click the button below to access your comprehensive audit results and recommendations.</p>
            <a href="${auditUrl}" class="button">View Audit Report</a>
        </div>
        
        <div class="info-box">
            <h4>📋 What's Next?</h4>
            <ul>
                <li>Review your audit findings</li>
                <li>Implement the recommended optimizations</li>
                <li>Monitor your analytics performance</li>
            </ul>
        </div>
        
        <p>
            If you have any questions about your audit results, feel free to reach out to our team.
        </p>
        
        <p>
            Best regards,<br>
            <strong>The AnalyticsLiv Team</strong>
        </p>
    `;

    const emailHtml = generateEmailTemplate(subject, html);

    return {
        to: [userEmail],
        subject: subject,
        html: emailHtml
    };
}


export async function sendSimpleAuditNotification(auditData, sendEmailFunction, fromEmail) {
    try {
        const emailConfig = generateSimpleAuditEmail(auditData);

        const result = await sendEmailFunction(
            emailConfig.to,
            emailConfig.subject,
            emailConfig.html,
            fromEmail
        );

        console.log('Simple audit notification sent successfully to:', auditData.userEmail);
        return { success: true };

    } catch (error) {
        console.error('Error sending simple audit notification:', error);
        throw error;
    }
}