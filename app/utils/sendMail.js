const sgMail = require('@sendgrid/mail');

// Set API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, html, from = 'noreply@analyticsliv.com') => {
    // Ensure 'to' is always an array
    const recipients = Array.isArray(to) ? to : [to];

    // Format 'from' as an object if it's a string
    const fromAddress = typeof from === 'string'
        ? { email: from, name: 'AnalyticsLiv' }
        : from;

    const msg = {
        to: recipients,
        from: fromAddress,
        subject,
        html,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent to:', to);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error.message);
        if (error.response) {
            console.error('Error details:', error.response.body);
        }
        throw error; // Re-throw to handle in the calling function
    }
};