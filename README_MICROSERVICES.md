# RailBooker - Microservices Architecture

## 🏗️ Architecture Overview

The RailBooker application has been refactored to use a **microservices architecture** with the email functionality extracted as a separate service.

### Services:

1. **Main Application** (`app`) - Port 3000
   - Handles train bookings, user authentication, and business logic
   - Communicates with the email service for sending notifications

2. **Email Microservice** (`email-service`) - Port 3001
   - Dedicated service for handling all email operations
   - Sends booking confirmations with QR codes
   - Independent scaling and deployment

3. **PostgreSQL** (`postgres`) - Port 5432
   - Database for storing application data

4. **Redis** (`redis`) - Port 6379
   - Caching and pub/sub messaging

## 🚀 Quick Start

### Option 1: Run with Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 2: Run Services Separately

#### Start Email Service:
```bash
cd email-service
npm install
cp .env.example .env
# Edit .env with your SMTP credentials
npm start
```

#### Start Main Application:
```bash
# In project root
npm install
npm start
```

## 📧 Email Service Configuration

Configure the following environment variables:

```env
# Email Service
EMAIL_SERVICE_PORT=3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Gmail Setup:
1. Enable 2-factor authentication
2. Generate an App Password (Google Account → Security → App passwords)
3. Use the app password in `EMAIL_PASS`

## 🔧 Testing Email Service

### Health Check:
```bash
curl http://localhost:3001/health
```

### Verify Configuration:
```bash
curl http://localhost:3001/verify
```

### Send Test Email:
```bash
curl -X POST http://localhost:3001/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "template": "bookingConfirmation",
    "data": {
      "booking": {...},
      "train": {...},
      "qrCode": "..."
    }
  }'
```

## 📂 Project Structure

```
project/
├── email-service/          # Email microservice
│   ├── server.js          # Main service file
│   ├── package.json       # Service dependencies
│   ├── Dockerfile         # Docker image config
│   └── .env.example       # Configuration template
├── config/
│   ├── email.js           # Email client wrapper
│   ├── emailServiceClient.js  # HTTP client for email service
│   └── queue.js           # Bull queue configuration
├── routes/                # API routes
├── services/              # Business logic
├── docker-compose.yml     # Multi-container orchestration
└── server.js              # Main application
```

## 🔄 Communication Flow

```
Main App → Email Service Client → HTTP Request → Email Service → SMTP Server → Recipient
```

1. Main application creates a booking
2. Queues email job using Bull
3. Queue worker calls email service client
4. Client makes HTTP POST to email service
5. Email service sends email via SMTP
6. Response returned to main application

## 📊 Monitoring

### Email Service Logs:
```bash
docker-compose logs -f email-service
```

### Check Queue Status:
The main application uses Bull queues with Redis for reliable email delivery.

### Health Monitoring:
- Email Service: `http://localhost:3001/health`
- Main App: `http://localhost:3000/api/time`

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use app-specific passwords** - Don't use your main email password
3. **Enable rate limiting** - Prevent email spam (to be implemented)
4. **Use HTTPS in production** - Encrypt communication between services
5. **Implement authentication** - Secure the email service API (to be implemented)

## 🚢 Deployment

### Docker Compose (Development):
```bash
docker-compose up -d
```

### Docker Compose (Production):
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes:
Create deployment and service manifests for each microservice.

### Environment Variables for Production:
Set these in your hosting environment:
- `EMAIL_SERVICE_URL` - URL of the email service
- `SMTP_HOST`, `SMTP_PORT`, `EMAIL_USER`, `EMAIL_PASS` - SMTP configuration

## 🛠️ Development

### Adding New Email Templates:
Edit `email-service/server.js` and add to the `emailTemplates` object.

### Testing Locally:
1. Start email service: `cd email-service && npm start`
2. Start main app: `npm start`
3. Make a booking to trigger email

## 📈 Scaling

The email service can be scaled independently:

```bash
docker-compose up -d --scale email-service=3
```

Add a load balancer (nginx/HAProxy) for distributing requests.

## 🐛 Troubleshooting

### Email Service Not Responding:
- Check if service is running: `docker ps`
- Check logs: `docker-compose logs email-service`
- Verify `EMAIL_SERVICE_URL` in main app

### Emails Not Sending:
- Verify SMTP credentials
- Check spam folder
- Review email service logs
- Test SMTP connection: Visit `/verify` endpoint

### Connection Refused:
- Ensure email service is started before main app
- Check network connectivity between containers
- Verify port 3001 is not blocked

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please create an issue on the GitHub repository.
