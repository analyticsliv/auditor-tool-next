import { sendSimpleAuditNotification } from "./genrateAuditTemplate";
import { sendEmail } from "./sendMail";



export async function notifyUserAuditComplete(userName, userEmail, propertyName, auditId) {
    try {
        const auditData = {
            userName,
            userEmail,
            propertyName,
            auditUrl: `https://ga4auditor.analyticsliv.com/previous-audit?id=${auditId}`
        };

        await sendSimpleAuditNotification(
            auditData,
            sendEmail,
            process.env.SENDGRID_FROM_EMAIL
        );

    } catch (error) {
        console.error('Failed to send audit notification:', error);
        throw error;
    }
}
