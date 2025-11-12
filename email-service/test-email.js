// Test script for Email Service
// Run with: node email-service/test-email.js

const axios = require('axios');

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';

// Test data
const testBooking = {
    pnrNumber: 'TEST123456',
    journeyDate: new Date().toISOString(),
    passengerName: 'Test User',
    passengerAge: 30,
    seatNumber: '12',
    coachNumber: 'A1',
    status: 'Confirmed'
};

const testTrain = {
    name: 'Express Train',
    trainNumber: '12345',
    source: 'Delhi',
    destination: 'Mumbai',
    departureTime: '10:00 AM',
    arrivalTime: '08:00 PM',
    duration: '10 hours',
    class: '2A',
    fromStation: { name: 'New Delhi Railway Station' },
    toStation: { name: 'Mumbai Central' }
};

const testQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testEmailService() {
    console.log('🧪 Testing Email Service...\n');

    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing Health Check...');
        const healthResponse = await axios.get(`${EMAIL_SERVICE_URL}/health`);
        console.log('✅ Health Check:', healthResponse.data);
        console.log('');

        // Test 2: Verify Configuration
        console.log('2️⃣ Testing SMTP Configuration...');
        try {
            const verifyResponse = await axios.get(`${EMAIL_SERVICE_URL}/verify`);
            console.log('✅ SMTP Verification:', verifyResponse.data);
        } catch (error) {
            console.log('❌ SMTP Verification Failed:', error.response?.data || error.message);
            console.log('💡 Make sure to configure EMAIL_USER and EMAIL_PASS in email-service/.env');
        }
        console.log('');

        // Test 3: Send Email (requires valid SMTP config)
        const recipientEmail = process.argv[2];
        if (recipientEmail) {
            console.log(`3️⃣ Sending test email to ${recipientEmail}...`);
            try {
                const emailResponse = await axios.post(`${EMAIL_SERVICE_URL}/send`, {
                    to: recipientEmail,
                    template: 'bookingConfirmation',
                    data: {
                        booking: testBooking,
                        train: testTrain,
                        qrCode: testQRCode
                    }
                });
                console.log('✅ Email Sent:', emailResponse.data);
                console.log('📧 Check your inbox!');
            } catch (error) {
                console.log('❌ Email Send Failed:', error.response?.data || error.message);
            }
        } else {
            console.log('3️⃣ Skipping email send test (no recipient provided)');
            console.log('💡 To test email sending, run: node email-service/test-email.js your-email@example.com');
        }
        console.log('');

        console.log('🎉 Email Service tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Email service is not running. Start it with:');
            console.log('   cd email-service && npm start');
        }
    }
}

// Run tests
testEmailService();
