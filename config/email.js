const { emailServiceClient } = require('./emailServiceClient');

// Send email function - delegates to email microservice
async function sendEmail(to, template, data) {
    try {
        console.log(`📧 Sending email to ${to} via email service...`);
        
        const result = await emailServiceClient.sendEmail(to, template, data);
        
        if (result.success) {
            console.log('✅ Email sent successfully via microservice:', result.messageId);
            return { success: true, messageId: result.messageId };
        } else {
            console.error('❌ Email sending failed:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('❌ Email service communication error:', error.message);
        return { success: false, error: error.message };
    }
}

// Verify email configuration - checks if email service is available
async function verifyEmailConfig() {
    try {
        const health = await emailServiceClient.healthCheck();
        if (!health.success) {
            throw new Error('Email service is not responding');
        }

        const verify = await emailServiceClient.verifyConfig();
        if (!verify.success) {
            throw new Error(verify.error || 'Email service configuration is invalid');
        }

        return true;
    } catch (error) {
        throw new Error(`Email service unavailable: ${error.message}`);
    }
}

module.exports = {
    sendEmail,
    verifyEmailConfig,
    emailServiceClient
};
