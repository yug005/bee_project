const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Email templates
const emailTemplates = {
    bookingConfirmation: (booking, train, qrCode) => ({
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
        .important { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
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
                
                <div class="row">
                    <span class="label">Train</span>
                    <span class="value">${train.name} (${train.trainNumber})</span>
                </div>
                
                <div class="row">
                    <span class="label">From</span>
                    <span class="value">${train.fromStation?.name || train.source}</span>
                </div>
                
                <div class="row">
                    <span class="label">To</span>
                    <span class="value">${train.toStation?.name || train.destination}</span>
                </div>
                
                <div class="row">
                    <span class="label">Journey Date</span>
                    <span class="value">${new Date(booking.journeyDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                
                <div class="row">
                    <span class="label">Departure</span>
                    <span class="value">${train.departureTime}</span>
                </div>
                
                <div class="row">
                    <span class="label">Arrival</span>
                    <span class="value">${train.arrivalTime}</span>
                </div>
                
                <div class="row">
                    <span class="label">Duration</span>
                    <span class="value">${train.duration}</span>
                </div>
                
                <div class="row">
                    <span class="label">Class</span>
                    <span class="value"><span class="badge">${train.class}</span></span>
                </div>
            </div>
            
            <div class="ticket">
                <h2 style="color: #1e40af; margin-top: 0;">Passenger Details</h2>
                
                <div class="row">
                    <span class="label">Name</span>
                    <span class="value">${booking.passengerName}</span>
                </div>
                
                <div class="row">
                    <span class="label">Age</span>
                    <span class="value">${booking.passengerAge} years</span>
                </div>
                
                <div class="row">
                    <span class="label">Coach</span>
                    <span class="value">${booking.coachNumber}</span>
                </div>
                
                <div class="row">
                    <span class="label">Seat Number</span>
                    <span class="value">${booking.seatNumber}</span>
                </div>
                
                <div class="row">
                    <span class="label">Booking Status</span>
                    <span class="value"><span class="badge">${booking.status}</span></span>
                </div>
            </div>
            
            ${qrCode ? `
            <div class="qr-section">
                <h3 style="color: #1e40af;">Digital Ticket</h3>
                <p style="color: #6b7280; font-size: 14px;">Scan this QR code at the station for verification</p>
                <img src="cid:qrcode@railbooker" alt="Booking QR Code" style="width: 250px; height: 250px; border: 4px solid #1e40af; border-radius: 10px; margin: 10px 0;">
                <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">
                    <strong>PNR: ${booking.pnrNumber}</strong><br>
                    Show this QR code for ticket verification
                </p>
            </div>
            ` : ''}
            
            <div class="important">
                <strong>⚠️ Important Instructions:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Carry a valid ID proof during your journey</li>
                    <li>Reach the station at least 30 minutes before departure</li>
                    <li>Keep this ticket email saved for verification</li>
                    <li>For cancellation, visit our website</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 10px 0;">Thank you for choosing RailBooker!</p>
            <p style="margin: 0;">For support: support@railbooker.com | www.railbooker.com</p>
            <p style="margin: 10px 0 0 0; font-size: 10px;">This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
🎫 BOOKING CONFIRMATION

PNR: ${booking.pnrNumber}

Journey Details:
- Train: ${train.name} (${train.trainNumber})
- From: ${train.fromStation?.name || train.source}
- To: ${train.toStation?.name || train.destination}
- Date: ${new Date(booking.journeyDate).toLocaleDateString('en-IN')}
- Departure: ${train.departureTime}
- Arrival: ${train.arrivalTime}
- Duration: ${train.duration}
- Class: ${train.class}

Passenger Details:
- Name: ${booking.passengerName}
- Age: ${booking.passengerAge} years
- Coach: ${booking.coachNumber}
- Seat: ${booking.seatNumber}
- Status: ${booking.status}

Important: Carry valid ID proof during journey.

Thank you for choosing RailBooker!
        `
    })
};

// Send email function
async function sendEmail(to, template, data) {
    try {
        const emailContent = emailTemplates[template](data.booking, data.train, data.qrCode);
        
        const mailOptions = {
            from: `"RailBooker 🚂" <${process.env.EMAIL_USER || 'noreply@railbooker.com'}>`,
            to,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html,
            // Attach QR code as inline image
            attachments: data.qrCode ? [{
                filename: 'ticket-qr.png',
                content: data.qrCode.split('base64,')[1],
                encoding: 'base64',
                cid: 'qrcode@railbooker'
            }] : []
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Verify email configuration
async function verifyEmailConfig() {
    try {
        await transporter.verify();
        return true;
    } catch (error) {
        throw new Error(`Email configuration invalid: ${error.message}`);
    }
}

module.exports = {
    sendEmail,
    verifyEmailConfig,
    transporter
};
