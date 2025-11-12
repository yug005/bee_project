require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { consumeMessages, connectQueue } = require('../shared/messageQueue');

const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Email templates
const emailTemplates = {
    bookingConfirmation: (data) => {
        const { booking, train, qrCode } = data;
        return {
            subject: `🎫 Booking Confirmed - PNR: ${booking.pnrNumber}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .ticket { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px dashed #e5e7eb; }
        .label { color: #6b7280; font-size: 14px; }
        .value { font-weight: bold; color: #1f2937; }
        .pnr { font-size: 32px; font-weight: bold; color: #1e40af; text-align: center; margin: 20px 0; letter-spacing: 2px; }
        .qr-section { text-align: center; margin: 20px 0; padding: 20px; background: white; border-radius: 10px; }
        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
        .badge { display: inline-block; padding: 5px 10px; background: #10b981; color: white; border-radius: 5px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚂 RailBooker</h1>
            <p style="margin: 0; font-size: 18px;">Your Ticket is Confirmed!</p>
        </div>
        <div class="content">
            <div class="pnr">PNR: ${booking.pnrNumber}</div>
            <div class="ticket">
                <h2 style="color: #1e40af; margin-top: 0;">Journey Details</h2>
                <div class="row"><span class="label">Train</span><span class="value">${train.name} (${train.trainNumber})</span></div>
                <div class="row"><span class="label">From</span><span class="value">${train.fromStation?.name || train.source}</span></div>
                <div class="row"><span class="label">To</span><span class="value">${train.toStation?.name || train.destination}</span></div>
                <div class="row"><span class="label">Journey Date</span><span class="value">${new Date(booking.journeyDate).toLocaleDateString('en-IN')}</span></div>
                <div class="row"><span class="label">Departure</span><span class="value">${train.departureTime}</span></div>
            </div>
            <div class="ticket">
                <h2 style="color: #1e40af; margin-top: 0;">Passenger Details</h2>
                <div class="row"><span class="label">Name</span><span class="value">${booking.passengerName}</span></div>
                <div class="row"><span class="label">Age</span><span class="value">${booking.passengerAge} years</span></div>
                <div class="row"><span class="label">Seat</span><span class="value">${booking.coachNumber}-${booking.seatNumber}</span></div>
            </div>
            ${qrCode ? `<div class="qr-section"><h3 style="color: #1e40af;">Digital Ticket</h3><img src="${qrCode}" alt="QR Code" style="width: 250px; height: 250px; border: 4px solid #1e40af; border-radius: 10px;"></div>` : ''}
        </div>
        <div class="footer">
            <p style="margin: 0;">Thank you for choosing RailBooker!</p>
        </div>
    </div>
</body>
</html>
            `,
            text: `Booking Confirmed\n\nPNR: ${booking.pnrNumber}\nTrain: ${train.name}\nPassenger: ${booking.passengerName}\nSeat: ${booking.coachNumber}-${booking.seatNumber}\n\nThank you for choosing RailBooker!`
        };
    },

    waitingListConfirmed: (data) => {
        const { booking, train, qrCode } = data;
        return {
            subject: `✅ Waiting List Confirmed - PNR: ${booking.pnrNumber}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .pnr { font-size: 32px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Great News!</h1>
            <p style="margin: 0; font-size: 18px;">Your Waiting List is Confirmed!</p>
        </div>
        <div class="content">
            <div class="pnr">PNR: ${booking.pnrNumber}</div>
            <p>Congratulations! Your waiting list booking has been confirmed.</p>
            <p><strong>Train:</strong> ${train.name} (${train.trainNumber})</p>
            <p><strong>Passenger:</strong> ${booking.passengerName}</p>
            <p><strong>Seat:</strong> ${booking.coachNumber}-${booking.seatNumber}</p>
            ${qrCode ? `<div style="text-align: center; margin: 20px 0;"><img src="${qrCode}" alt="QR Code" style="width: 250px;"></div>` : ''}
        </div>
    </div>
</body>
</html>
            `,
            text: `Great News! Your waiting list booking is now confirmed.\n\nPNR: ${booking.pnrNumber}\nTrain: ${train.name}\nPassenger: ${booking.passengerName}`
        };
    }
};

// Send email function
async function sendEmail(to, template, data) {
    try {
        const emailContent = emailTemplates[template](data);
        
        const mailOptions = {
            from: `"RailBooker" <${process.env.EMAIL_USER}>`,
            to,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'notification-service' });
});

// Manual email endpoint (for testing or direct use)
app.post('/send-email', async (req, res) => {
    const { to, type, data } = req.body;

    if (!to || !type || !data) {
        return res.status(400).json({ error: 'Missing required fields: to, type, data' });
    }

    const result = await sendEmail(to, type, data);
    
    if (result.success) {
        res.json({ message: 'Email sent successfully', messageId: result.messageId });
    } else {
        res.status(500).json({ error: 'Failed to send email', details: result.error });
    }
});

// Verify email configuration
app.get('/verify', async (req, res) => {
    try {
        await transporter.verify();
        res.json({ message: 'Email configuration is valid', status: 'ready' });
    } catch (error) {
        res.status(500).json({ error: 'Email configuration invalid', details: error.message });
    }
});

// Initialize queue consumer
async function initializeQueueConsumer() {
    const queue = await connectQueue();
    
    if (queue) {
        // Consume email queue
        await consumeMessages('email-queue', async (message) => {
            console.log('📧 Processing email:', message);
            const { to, type, data } = message;
            await sendEmail(to, type, data);
        });
        
        console.log('📬 Email queue consumer started');
    } else {
        console.warn('⚠️ Queue not available - emails can be sent via HTTP endpoint');
    }
}

// Start server
app.listen(PORT, async () => {
    console.log(`📧 Notification Service running on http://localhost:${PORT}`);
    
    // Verify email config
    try {
        await transporter.verify();
        console.log('✅ Email configuration verified');
    } catch (error) {
        console.warn('⚠️ Email not configured:', error.message);
    }
    
    // Initialize queue consumer
    await initializeQueueConsumer();
});

module.exports = app;
