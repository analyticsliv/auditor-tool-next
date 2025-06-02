const sgMail = require('@sendgrid/mail');

// Set API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, html, from) => {
    const msg = {
        to,
        from, // Ensure 'from' is a verified email address
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