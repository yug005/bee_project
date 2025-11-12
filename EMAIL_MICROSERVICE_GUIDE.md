# 📧 Email Microservice Implementation - Complete Guide

## 🎉 What Has Been Created

Your RailBooker application has been successfully refactored to use a **microservices architecture** with email functionality as a separate service!

## 📦 Created Files

### New Microservice Structure
```
email-service/
├── server.js              # Email microservice server
├── package.json           # Dependencies (express, nodemailer)
├── Dockerfile             # Container configuration
├── .env.example           # Environment template
├── .dockerignore          # Docker ignore rules
├── .gitignore             # Git ignore rules
├── test-email.js          # Testing utility
└── README.md              # Service documentation
```

### Updated Main Application
```
config/
├── email.js               # Updated to use microservice
└── emailServiceClient.js  # NEW: HTTP client for email service

docker-compose.yml         # Updated with email service
package.json              # Added axios dependency
start-services.ps1        # NEW: Windows startup script
start-services.sh         # NEW: Linux/Mac startup script
```

### Documentation
```
README_MICROSERVICES.md   # Microservices architecture guide
SETUP_GUIDE.md           # Step-by-step setup instructions
ARCHITECTURE_DIAGRAM.md  # Visual architecture diagrams
IMPLEMENTATION_SUMMARY.md # What was done summary
```

## 🚀 Quick Start (3 Steps)

### Step 1: Configure Email Service

```powershell
# Copy environment template
cd email-service
cp .env.example .env
```

Edit `email-service/.env`:
```env
EMAIL_SERVICE_PORT=3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

**Gmail App Password Setup:**
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to "App passwords"
4. Generate password for "Mail"
5. Copy to `EMAIL_PASS`

### Step 2: Install Dependencies

```powershell
# Main app
npm install

# Email service
cd email-service
npm install
cd ..
```

### Step 3: Start Services

**Option A - Using Startup Script (Easiest):**
```powershell
.\start-services.ps1
```

**Option B - Manual (Two terminals):**

Terminal 1:
```powershell
cd email-service
npm start
```

Terminal 2:
```powershell
npm start
```

**Option C - Docker Compose:**
```powershell
docker-compose up -d
```

## ✅ Verify Everything Works

### 1. Check Email Service Health
```powershell
curl http://localhost:3001/health
```

Expected: `{"status":"healthy","service":"email-service",...}`

### 2. Verify SMTP Configuration
```powershell
curl http://localhost:3001/verify
```

Expected: `{"success":true,"message":"Email service is configured correctly"}`

### 3. Test Email Sending
```powershell
node email-service/test-email.js your-email@example.com
```

### 4. Use the Application
1. Open http://localhost:3000
2. Register/Login
3. Book a train ticket
4. Check your email for confirmation! 📧

## 🏗️ How It Works

### Before (Monolithic):
```
Main App → nodemailer → SMTP → Email Recipient
```

### After (Microservices):
```
Main App → Email Service Client → Email Microservice → SMTP → Recipient
           (HTTP/axios)          (Port 3001)
```

### Request Flow:
1. User books ticket
2. Main app creates booking + QR code
3. Job added to Bull queue
4. Queue worker calls email service via HTTP
5. Email service sends email via SMTP
6. User receives beautiful email with ticket!

## 📡 Email Service API

### Available Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check service health |
| GET | `/verify` | Verify SMTP configuration |
| POST | `/send` | Send single email |
| POST | `/send-batch` | Send multiple emails |

### Example: Send Email

```javascript
// Using the client (in your code)
const { emailServiceClient } = require('./config/emailServiceClient');

await emailServiceClient.sendBookingConfirmation(
    'user@example.com',
    booking,
    train,
    qrCodeDataURL
);
```

```bash
# Using curl
curl -X POST http://localhost:3001/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "template": "bookingConfirmation",
    "data": {
      "booking": {...},
      "train": {...},
      "qrCode": "data:image/png;base64,..."
    }
  }'
```

## 🔧 Configuration

### Main App Environment Variables
Add to your root `.env`:
```env
EMAIL_SERVICE_URL=http://localhost:3001
```

### Email Service Environment Variables
In `email-service/.env`:
```env
EMAIL_SERVICE_PORT=3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🐳 Docker Deployment

### Development
```powershell
docker-compose up -d
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Email service only
docker-compose logs -f email-service
```

### Stop Services
```powershell
docker-compose down
```

## 🧪 Testing

### Automated Test
```powershell
# Basic health check
node email-service/test-email.js

# Send real email
node email-service/test-email.js your-email@example.com
```

### Manual Testing
1. Start email service
2. Visit http://localhost:3001/health
3. Visit http://localhost:3001/verify
4. Use Postman/curl to send test email

## 🎯 Benefits of Microservices Architecture

✅ **Scalability** - Scale email service independently  
✅ **Reliability** - Email failures don't crash main app  
✅ **Maintainability** - Email logic isolated and easy to update  
✅ **Flexibility** - Easy to switch SMTP providers  
✅ **Monitoring** - Separate logs and metrics  
✅ **Security** - Email credentials isolated  
✅ **Development** - Teams can work independently  

## 📊 Service Status URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Main App | http://localhost:3000 | RailBooker application |
| Email Service | http://localhost:3001 | Email microservice |
| Health Check | http://localhost:3001/health | Service status |
| SMTP Verify | http://localhost:3001/verify | Check email config |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache/Queue |

## 🐛 Troubleshooting

### Issue: Email Service Won't Start
**Solution:**
- Check if port 3001 is available
- Verify .env file exists in email-service/
- Check logs for errors

### Issue: "Invalid login" Error
**Solution:**
- Use Gmail App Password, not regular password
- Enable 2-Factor Authentication first
- Verify EMAIL_USER and EMAIL_PASS are correct

### Issue: Main App Can't Connect to Email Service
**Solution:**
- Start email service before main app
- Check EMAIL_SERVICE_URL environment variable
- Verify email service is running: `curl http://localhost:3001/health`

### Issue: Emails Not Received
**Solution:**
- Check spam folder
- Verify SMTP settings at `/verify` endpoint
- Check email service logs
- Test with test-email.js script

### Issue: Connection Refused
**Solution:**
```powershell
# Check if email service is running
curl http://localhost:3001/health

# If not, start it
cd email-service
npm start
```

## 📚 Documentation Files

- **SETUP_GUIDE.md** - Detailed setup instructions
- **README_MICROSERVICES.md** - Architecture and deployment guide
- **ARCHITECTURE_DIAGRAM.md** - Visual system diagrams
- **IMPLEMENTATION_SUMMARY.md** - What was implemented
- **email-service/README.md** - Email service API docs

## 🔐 Security Best Practices

✅ Never commit `.env` files  
✅ Use app-specific passwords  
✅ Keep services updated  
✅ Use HTTPS in production  
✅ Implement rate limiting  
✅ Add API authentication (future enhancement)  

## 🎓 What You Learned

1. ✅ Microservices architecture patterns
2. ✅ Service-to-service communication (HTTP)
3. ✅ Docker multi-container applications
4. ✅ Email service implementation
5. ✅ Queue-based async processing
6. ✅ Environment-based configuration
7. ✅ Health checks and monitoring

## 🚀 Next Steps (Optional Enhancements)

- [ ] Add authentication to email service API
- [ ] Implement rate limiting
- [ ] Add more email templates (password reset, etc.)
- [ ] Add email analytics and tracking
- [ ] Implement retry logic with exponential backoff
- [ ] Add support for multiple SMTP providers
- [ ] Create admin UI for email service
- [ ] Add email preview/testing interface
- [ ] Implement email scheduling
- [ ] Add email open/click tracking

## 💡 Tips

- Keep email service running in background during development
- Use the startup script for convenience
- Check health endpoint before debugging
- Monitor logs for email send confirmations
- Test with real email addresses for best results

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review the documentation files
3. Check service logs for errors
4. Verify environment variables are set correctly
5. Test email service independently first

## 🎉 Success Indicators

You know everything is working when:

✅ Email service responds to `/health`  
✅ SMTP verification returns success  
✅ Main app starts without errors  
✅ Bookings trigger emails  
✅ Emails arrive in inbox with QR codes  
✅ Logs show successful email sends  

---

## 🏁 You're All Set!

Your application now has a modern, scalable microservices architecture for handling emails. The email functionality is completely isolated, can scale independently, and is ready for production deployment.

**Happy coding! 🚀**

---

*For more details, see the comprehensive documentation in:*
- `SETUP_GUIDE.md`
- `README_MICROSERVICES.md`
- `ARCHITECTURE_DIAGRAM.md`
- `email-service/README.md`
