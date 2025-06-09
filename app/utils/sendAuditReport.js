import { sendSimpleAuditNotification } from "./genrateAuditTemplate";



export async function notifyUserAuditComplete(userName, userEmail, propertyName, auditId) {
    try {
        const auditData = {
            userName,
            userEmail,
            propertyName,
            auditUrl: `${process.env.NEXTAUTH_URL}/audit-report/${auditId}`
        };

        await sendSimpleAuditNotification(
            auditData,
            sendEmail,
            process.env.SENDGRID_FROM_EMAIL
        );

        console.log(`Audit notification sent to ${userEmail} for property: ${propertyName}`);

    } catch (error) {
        console.error('Failed to send audit notification:', error);
        throw error;
    }
}
