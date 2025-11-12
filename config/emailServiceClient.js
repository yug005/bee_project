const axios = require('axios');

// Email Service Client
class EmailServiceClient {
    constructor(baseURL = null) {
        this.baseURL = baseURL || process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000, // 30 seconds
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                console.log(`📧 Email service request: ${config.method.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('📧 Email service request error:', error.message);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for logging
        this.client.interceptors.response.use(
            (response) => {
                console.log(`✅ Email service response: ${response.status} ${response.statusText}`);
                return response;
            },
            (error) => {
                if (error.response) {
                    console.error(`❌ Email service error: ${error.response.status} - ${error.response.data?.error || error.message}`);
                } else if (error.request) {
                    console.error('❌ Email service not responding. Is the service running?');
                } else {
                    console.error('❌ Email service error:', error.message);
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Check if email service is healthy
     */
    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verify email configuration
     */
    async verifyConfig() {
        try {
            const response = await this.client.get('/verify');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Send a single email
     * @param {string} to - Recipient email address
     * @param {string} template - Email template name
     * @param {object} data - Template data (booking, train, qrCode)
     */
    async sendEmail(to, template, data) {
        try {
            const response = await this.client.post('/send', {
                to,
                template,
                data
            });

            return {
                success: true,
                messageId: response.data.messageId,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Send batch emails
     * @param {Array} emails - Array of email objects {to, template, data}
     */
    async sendBatchEmails(emails) {
        try {
            const response = await this.client.post('/send-batch', {
                emails
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Send booking confirmation email
     * @param {string} to - Recipient email
     * @param {object} booking - Booking details
     * @param {object} train - Train details
     * @param {string} qrCode - QR code data URL
     */
    async sendBookingConfirmation(to, booking, train, qrCode) {
        return this.sendEmail(to, 'bookingConfirmation', {
            booking,
            train,
            qrCode
        });
    }
}

// Create singleton instance
const emailServiceClient = new EmailServiceClient();

// Export both the class and the instance
module.exports = {
    EmailServiceClient,
    emailServiceClient
};
