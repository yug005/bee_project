# 🚀 Quick Start Guide - Email Microservice Setup

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Gmail account (or other SMTP provider)

## Step 1: Install Dependencies

### Main Application:
```powershell
npm install
```

### Email Service:
```powershell
cd email-service
npm install
cd ..
```

## Step 2: Configure Email Service

1. Copy the example environment file:
```powershell
cd email-service
cp .env.example .env
```

2. Edit `email-service/.env` with your email credentials:
```env
EMAIL_SERVICE_PORT=3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Gmail Setup:
1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Generate an app password for "Mail"
5. Copy that password to `EMAIL_PASS`

## Step 3: Start Services

### Option A: Using Start Script (Windows)
```powershell
.\start-services.ps1
```

### Option B: Using Start Script (Linux/Mac)
```bash
chmod +x start-services.sh
./start-services.sh
```

### Option C: Manual Start

**Terminal 1 - Email Service:**
```powershell
cd email-service
npm start
```

**Terminal 2 - Main Application:**
```powershell
npm start
```

### Option D: Using Docker Compose
```powershell
docker-compose up -d
```

## Step 4: Verify Setup

1. **Check Email Service Health:**
```powershell
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "email-service",
  "timestamp": "2025-11-12T..."
}
```

2. **Verify SMTP Configuration:**
```powershell
curl http://localhost:3001/verify
```

Expected response:
```json
{
  "success": true,
  "message": "Email service is configured correctly"
}
```

3. **Check Main Application:**
```powershell
curl http://localhost:3000/api/time
```

## Step 5: Test Email Sending

1. Open the application: http://localhost:3000
2. Register/Login as a user
3. Book a train ticket
4. Check your email for the booking confirmation

## 🔍 Troubleshooting

### Email Service Won't Start
- Check if port 3001 is already in use
- Verify Node.js is installed: `node --version`
- Check for syntax errors in `.env` file

### "Invalid login" Error
- Verify you're using an **App Password**, not your regular Gmail password
- Check that 2FA is enabled on your Google account
- Ensure EMAIL_USER and EMAIL_PASS are correct

### Emails Not Received
- Check your spam folder
- Verify SMTP settings
- Check email service logs for errors
- Test SMTP connection at http://localhost:3001/verify

### Connection Refused
- Ensure email service is running
- Check EMAIL_SERVICE_URL in main app (default: http://localhost:3001)
- Verify firewall isn't blocking port 3001

### Main App Can't Connect to Email Service
- Start email service before main application
- Check that EMAIL_SERVICE_URL environment variable is set correctly
- For Docker: ensure both containers are on the same network

## 📁 Environment Variables

### Main Application (.env in root):
```env
PORT=3000
EMAIL_SERVICE_URL=http://localhost:3001
DATABASE_URL=postgresql://...
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Email Service (email-service/.env):
```env
EMAIL_SERVICE_PORT=3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🐳 Docker Commands

```powershell
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View email service logs only
docker-compose logs -f email-service

# Stop all services
docker-compose down

# Rebuild services
docker-compose up -d --build
```

## 📊 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Main App | http://localhost:3000 | RailBooker application |
| Email Service | http://localhost:3001 | Email microservice |
| Health Check | http://localhost:3001/health | Service status |
| Verify SMTP | http://localhost:3001/verify | Check email config |

## 🎯 Next Steps

1. ✅ Services running successfully
2. 📧 Email configuration verified
3. 🎫 Test booking creation and email sending
4. 🚀 Ready for development!

## 📞 Getting Help

If you encounter issues:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Ensure ports 3000 and 3001 are available
4. Review the main README_MICROSERVICES.md for detailed documentation

## 🎉 Success Indicators

You know everything is working when:
- ✅ Email service responds to health check
- ✅ Main app starts without errors
- ✅ SMTP verification returns success
- ✅ Booking confirmation emails are received
- ✅ Email service logs show successful sends

Happy coding! 🚀
