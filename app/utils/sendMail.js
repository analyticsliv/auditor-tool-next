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
        // Disable SendGrid's click-tracking + open-tracking so transactional
        // links (invite acceptance, agency dashboard, etc.) point straight at
        // our domain instead of being rewritten through the SendGrid proxy
        // (urlNNN.analyticsliv.com), which has been throwing
        // ERR_CERT_COMMON_NAME_INVALID for recipients.
        trackingSettings: {
            clickTracking:        { enable: false, enableText: false },
            openTracking:         { enable: false },
            subscriptionTracking: { enable: false },
            ganalytics:           { enable: false },
        },
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