# 🚂 RailBooker - Advanced Railway Booking System

A modern, feature-rich railway ticket booking system built with Node.js, Express, PostgreSQL, Redis, and Socket.IO. The system includes real-time seat availability updates, waiting list management, QR code generation, Google OAuth authentication, and a comprehensive admin panel.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red.svg)](https://redis.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black.svg)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16-darkblue.svg)](https://www.prisma.io/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Key Features Explained](#-key-features-explained)
- [WebSocket Events](#-websocket-events)
- [Utility Scripts](#-utility-scripts)
- [Docker Deployment](#-docker-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎫 Core Booking Features
- **Real-time Seat Booking**: Book train tickets with instant seat availability updates
- **Seat Selection**: Interactive seat map for choosing specific seats and coaches
- **Waiting List Management**: Automatic promotion from waiting list to confirmed when seats become available
- **RAC (Reservation Against Cancellation)**: Smart RAC system implementation
- **Ticket Cancellation**: Cancel bookings and automatically process waiting list

### 👤 User Management
- **User Registration & Login**: Secure authentication with bcrypt password hashing
- **Google OAuth Integration**: Sign in with Google account (Passport.js)
- **JWT Token Authentication**: Stateless authentication for API requests
- **Session Management**: Express sessions for persistent login
- **Profile Management**: Update profile information and view booking history

### 🔐 Admin Panel
- **Admin Dashboard**: Comprehensive statistics and system overview
- **User Management**: View and manage all registered users
- **Train Management**: Add, update, and delete trains
- **Booking Overview**: Monitor all bookings and their statuses
- **Location Management**: Manage states, cities, and stations
- **System Analytics**: Real-time metrics and performance monitoring

### 🚀 Advanced Features
- **Real-time Updates**: WebSocket-based live updates for bookings and train status
- **QR Code Generation**: Generate unique QR codes for each confirmed ticket
- **Email Notifications**: Send booking confirmations via email (Nodemailer)
- **Multi-language Support**: i18n support with language switcher (English, Hindi, etc.)
- **Progressive Web App**: Service worker for offline capability
- **Caching System**: Redis-based caching for improved performance
- **Message Queue**: Bull queue for background job processing
- **Pub/Sub System**: Redis pub/sub for distributed system communication

### 🎨 UI/UX Features
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Interactive UI**: Smooth animations and transitions
- **Loading States**: Skeleton loaders and progress indicators
- **Search & Filter**: Advanced search for trains by stations, dates, and more

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 5.1
- **Database**: PostgreSQL 15
- **ORM**: Prisma 6.16
- **Cache**: Redis 7.x
- **Queue**: Bull (Redis-based job queue)
- **WebSocket**: Socket.IO 4.8
- **Authentication**: Passport.js, JWT, bcryptjs

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **UI Framework**: Tailwind CSS
- **Icons**: Font Awesome
- **Real-time**: Socket.IO Client
- **PWA**: Service Worker, Web Manifest

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **Version Control**: Git
- **Environment Management**: dotenv
- **Email Service**: Nodemailer

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   HTML/CSS  │  │  JavaScript  │  │  Socket.IO Client│   │
│  │  Tailwind   │  │   (main.js)  │  │   (Real-time)    │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/WebSocket
┌────────────────────────────┴────────────────────────────────┐
│                    Express.js Server                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                         │   │
│  │  • Authentication (JWT/Passport)                      │   │
│  │  • Session Management                                 │   │
│  │  • CORS & Security                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Routes/Controllers                       │   │
│  │  • /api/auth    - Authentication                      │   │
│  │  • /api/users   - User management                     │   │
│  │  • /api/trains  - Train operations                    │   │
│  │  • /api/bookings - Booking operations                 │   │
│  │  • /api/locations - Location data                     │   │
│  │  • /api/admin   - Admin panel                         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Business Logic                           │   │
│  │  • Waiting List Manager                               │   │
│  │  • Seat Allocation                                    │   │
│  │  • QR Code Generation                                 │   │
│  │  • Email Notifications                                │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼──────┐    ┌───────▼──────┐    ┌───────▼──────┐
│  PostgreSQL  │    │    Redis     │    │  Socket.IO   │
│   Database   │    │ Cache/Queue  │    │   Server     │
│              │    │   Pub/Sub    │    │ (Real-time)  │
│  • Users     │    │              │    │              │
│  • Trains    │    │ • Caching    │    │ • Live       │
│  • Bookings  │    │ • Bull Queue │    │   Updates    │
│  • Locations │    │ • Pub/Sub    │    │ • Broadcast  │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Data Flow

1. **User Request** → Client sends HTTP request or WebSocket message
2. **Authentication** → Middleware validates JWT/session
3. **Business Logic** → Route handlers process request
4. **Cache Check** → Redis cache checked for frequent data
5. **Database Query** → Prisma ORM queries PostgreSQL
6. **Cache Update** → Results cached in Redis
7. **Response** → Data sent back to client
8. **Real-time Broadcast** → WebSocket events emitted to connected clients

---

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│    User     │         │   Booking   │
├─────────────┤         ├─────────────┤
│ id          │◄───────┤│ id          │
│ username    │         │ userId      │
│ email       │         │ trainId     │
│ password    │         │ journeyDate │
│ role        │         │ seatNumber  │
│ googleId    │         │ coachNumber │
│ provider    │         │ pnrNumber   │
└─────────────┘         │ qrCode      │
                        │ status      │
                        │ passengerName│
                        │ waitingPosition│
                        └─────────────┘
                              │
┌─────────────┐         ┌─────▼───────┐         ┌─────────────┐
│   State     │         │   Train     │         │   Station   │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id          │         │ id          │         │ id          │
│ name        │         │ name        │         │ name        │
│ code        │         │ trainNumber │         │ code        │
└──────┬──────┘         │ totalSeats  │         │ cityId      │
       │                │ availableSeats│        └──────┬──────┘
┌──────▼──────┐         │ departureTime│              │
│    City     │         │ arrivalTime │         ┌──────▼──────┐
├─────────────┤         │ price       │         │    City     │
│ id          │         │ class       │         ├─────────────┤
│ name        │         │ trainType   │         │ id          │
│ stateId     │         │ fromStationId│        │ name        │
└─────────────┘         │ toStationId │         │ stateId     │
                        └─────────────┘         └─────────────┘
```

### Models Overview

- **User**: Authentication and user profile data
- **Booking**: Ticket bookings with status tracking
- **Train**: Train information and seat availability
- **Station**: Railway stations with unique codes
- **City**: Cities where stations are located
- **State**: States/provinces for location hierarchy

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v15 or higher) - [Download](https://www.postgresql.org/)
- **Redis** (v7.x or higher) - [Download](https://redis.io/)
- **npm** or **yarn** - Package manager
- **Git** - Version control

### Optional
- **Docker** & **Docker Compose** - For containerized deployment
- **Postman** - For API testing

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yug005/bee_project.git
cd bee_project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### PostgreSQL

1. **Create a database**:
   ```sql
   CREATE DATABASE railbooker;
   ```

2. **Run Prisma migrations**:
   ```bash
   npx prisma migrate dev
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

#### Redis

Ensure Redis is running:
```bash
# Check Redis status
redis-cli ping
# Should return: PONG
```

### 4. Seed Database (Optional)

Populate the database with sample data:
```bash
node utils/seed.js
```

This creates:
- Sample states, cities, and stations
- Multiple train routes
- Initial admin user

### 5. Create Admin User

```bash
node utils/createAdmin.js
```

Follow the prompts to create your admin account.

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/railbooker"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-super-secret-session-key-change-in-production

# Email Configuration (Gmail Example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# RabbitMQ (Optional - for microservices)
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### Important Notes:
- **JWT_SECRET**: Use a strong random string for production
- **EMAIL_PASS**: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)
- **DATABASE_URL**: Update with your PostgreSQL credentials
- **Google OAuth**: Register your app at [Google Cloud Console](https://console.cloud.google.com/)

---

## 🏃 Running the Application

### Development Mode

```bash
# Start the server
node server.js
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

### With Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Checking Service Status

```bash
# Check PostgreSQL
psql -U postgres -c "SELECT version();"

# Check Redis
redis-cli ping

# Check application
curl http://localhost:3000/api/time
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "johndoe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Google OAuth Login
```http
GET /api/auth/google
# Redirects to Google OAuth consent screen
```

### Train Endpoints

#### Get All Trains
```http
GET /api/trains
Authorization: Bearer {token}

Response:
[
  {
    "id": 1,
    "name": "Rajdhani Express",
    "trainNumber": "12301",
    "fromStation": { "name": "New Delhi", "code": "NDLS" },
    "toStation": { "name": "Mumbai", "code": "BCT" },
    "totalSeats": 100,
    "availableSeats": 45,
    "departureTime": "16:55",
    "arrivalTime": "08:35",
    "price": 1500.00,
    "class": "AC 3-Tier"
  }
]
```

#### Search Trains
```http
GET /api/trains/search?from={stationId}&to={stationId}&date={YYYY-MM-DD}
Authorization: Bearer {token}
```

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "trainId": 1,
  "journeyDate": "2025-12-01",
  "passengerName": "John Doe",
  "passengerAge": 30,
  "seatNumber": "A1",
  "coachNumber": "S3"
}

Response:
{
  "booking": {
    "id": 123,
    "pnrNumber": "PNR123456789",
    "status": "Confirmed",
    "qrCode": "data:image/png;base64,...",
    "seatNumber": "A1",
    "coachNumber": "S3"
  }
}
```

#### Get User Bookings
```http
GET /api/bookings
Authorization: Bearer {token}
```

#### Cancel Booking
```http
DELETE /api/bookings/{bookingId}
Authorization: Bearer {token}
```

### Location Endpoints

#### Get All States
```http
GET /api/locations/states
```

#### Get Cities by State
```http
GET /api/locations/cities/{stateId}
```

#### Get Stations by City
```http
GET /api/locations/stations/{cityId}
```

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /api/admin/stats
Authorization: Bearer {admin-token}

Response:
{
  "totalUsers": 150,
  "totalTrains": 25,
  "totalBookings": 450,
  "confirmedBookings": 380,
  "waitingListBookings": 70
}
```

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer {admin-token}
```

#### Update Train
```http
PUT /api/admin/trains/{trainId}
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Updated Train Name",
  "availableSeats": 100
}
```

---

## 📁 Project Structure

```
project/
├── config/                     # Configuration files
│   ├── database.js            # Database connection
│   ├── email.js               # Email (Nodemailer) config
│   ├── passport.js            # Passport.js strategies
│   ├── queue.js               # Bull queue configuration
│   └── redis.js               # Redis client setup
│
├── middleware/                 # Express middleware
│   ├── authMiddleware.js      # JWT authentication
│   └── adminMiddleware.js     # Admin role verification
│
├── prisma/                     # Prisma ORM
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
│
├── public/                     # Frontend static files
│   ├── index.html             # Main HTML file
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Service worker for PWA
│   ├── css/
│   │   └── style.css          # Custom styles
│   ├── js/
│   │   ├── main.js            # Main application logic
│   │   ├── seatSelection.js   # Seat selection UI
│   │   └── translations.js    # i18n translations
│   └── images/                # Static images
│
├── routes/                     # API route handlers
│   ├── auth.js                # Authentication routes
│   ├── users.js               # User management
│   ├── trains.js              # Train operations
│   ├── bookings.js            # Booking operations
│   ├── locations.js           # Location data
│   └── admin.js               # Admin panel routes
│
├── services/                   # Business logic services
│   ├── waitingListManager.js  # Waiting list processing
│   └── waitingListProcessor.js # Background job processor
│
├── utils/                      # Utility scripts
│   ├── seed.js                # Database seeding
│   ├── createAdmin.js         # Create admin user
│   ├── trainData.js           # Sample train data
│   ├── locationData.js        # Sample location data
│   ├── resetTrains.js         # Reset train availability
│   ├── makeTrainsFull.js      # Fill trains for testing
│   ├── setupWaitingListTest.js # Test waiting list
│   └── showTrainStatus.js     # Display train status
│
├── docker-compose.yml          # Docker services configuration
├── package.json                # Node.js dependencies
├── server.js                   # Main application entry point
└── .env                        # Environment variables
```

---

## 🎯 Key Features Explained

### 1. Real-time Updates with WebSocket

The application uses Socket.IO for bidirectional real-time communication:

**Server-side** (`server.js`):
```javascript
io.on('connection', (socket) => {
  // Handle new booking events
  socket.on('new-booking', async (bookingData) => {
    io.emit('booking-update', bookingData);
  });
  
  // Handle train updates
  socket.on('train-update', async (trainData) => {
    io.emit('train-status-update', trainData);
  });
});
```

**Client-side** (`public/js/main.js`):
```javascript
socket.on('booking-update', (data) => {
  showMessage('New booking made!', 'success');
  fetchTrains(); // Refresh train list
});
```

### 2. Waiting List Management

The system automatically promotes users from waiting list to confirmed:

1. User books when no seats available → Added to waiting list
2. Another user cancels → Seat becomes available
3. System automatically:
   - Confirms next person in waiting list
   - Generates QR code for their ticket
   - Sends email notification
   - Updates waiting positions for others

**Implementation** (`services/waitingListManager.js`):
```javascript
async function processWaitingList(trainId, journeyDate) {
  // Get next person in line
  const nextInLine = await prisma.booking.findFirst({
    where: { status: 'Waiting' },
    orderBy: { waitingPosition: 'asc' }
  });
  
  // Confirm their booking
  await confirmBooking(nextInLine);
  
  // Update other waiting positions
  await updateWaitingPositions(trainId, journeyDate);
}
```

### 3. Caching Strategy

Redis caching improves performance for frequently accessed data:

```javascript
// Check cache first
let trains = await cache.get('trains:all');

if (!trains) {
  // Cache miss - fetch from database
  trains = await prisma.train.findMany();
  
  // Cache for 5 minutes
  await cache.set('trains:all', trains, 300);
}
```

**Cache Invalidation**:
- Booking created → Invalidate train cache
- Train updated → Invalidate specific train cache
- Seat cancelled → Invalidate train cache

### 4. QR Code Generation

Each confirmed booking gets a unique QR code:

```javascript
const qrData = JSON.stringify({
  pnr: booking.pnrNumber,
  passengerName: booking.passengerName,
  trainNumber: train.trainNumber,
  journeyDate: booking.journeyDate,
  seat: booking.seatNumber
});

const qrCode = await QRCode.toDataURL(qrData);
```

### 5. Email Notifications

Nodemailer sends booking confirmations:

```javascript
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: user.email,
  subject: 'Booking Confirmed - PNR: ' + booking.pnrNumber,
  html: emailTemplate(booking)
};

await transporter.sendMail(mailOptions);
```

### 6. Role-Based Access Control (RBAC)

Middleware protects admin routes:

```javascript
// authMiddleware.js
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = decoded;
  next();
}

// adminMiddleware.js
function verifyAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}
```

### 7. Seat Selection System

Interactive seat map (`public/js/seatSelection.js`):
- Visual representation of train coaches
- Color-coded seat status (Available, Booked, Selected)
- Click to select/deselect seats
- Real-time availability updates

---

## 🔌 WebSocket Events

### Client → Server

| Event | Description | Payload |
|-------|-------------|---------|
| `new-booking` | New booking created | `{ trainId, userId, seatNumber }` |
| `train-update` | Train info updated | `{ trainId, availableSeats }` |
| `request-live-data` | Request current train data | `{}` |

### Server → Client

| Event | Description | Payload |
|-------|-------------|---------|
| `booking-update` | Booking status changed | `{ bookingId, status }` |
| `train-status-update` | Train availability changed | `{ trainId, availableSeats }` |
| `live-train-data` | Current train information | `[{ train objects }]` |
| `error` | Error occurred | `{ message }` |

---

## 🛠 Utility Scripts

### Seed Database
```bash
node utils/seed.js
```
Populates database with sample states, cities, stations, and trains.

### Create Admin User
```bash
node utils/createAdmin.js
```
Interactive script to create an admin account.

### Reset Train Availability
```bash
node utils/resetTrains.js
```
Resets all trains to full availability (100 seats).

### Make Trains Full
```bash
node utils/makeTrainsFull.js
```
Fills all trains to test waiting list functionality.

### Show Train Status
```bash
node utils/showTrainStatus.js
```
Displays current status of all trains.

### Setup Waiting List Test
```bash
node utils/setupWaitingListTest.js
```
Creates test bookings to demonstrate waiting list.

---

## 🐳 Docker Deployment

### Using Docker Compose

The project includes a complete microservices architecture setup:

```bash
# Start all services
docker-compose up -d

# Services included:
# - PostgreSQL (port 5432)
# - Redis (port 6379)
# - RabbitMQ (port 5672, management: 15672)
# - Auth Service (port 3001)
# - Train Service (port 3002)
# - Booking Service (port 3003)
# - Notification Service (port 3004)
# - API Gateway (port 3000)
```

### Accessing Services

- **Application**: http://localhost:3000
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Container Management

```bash
# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Stop all services
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v
```

---

## 🧪 Testing

### Manual Testing

1. **Register a new user**
2. **Login and view trains**
3. **Book a ticket**
4. **Check booking in "My Bookings"**
5. **Test cancellation**
6. **Verify waiting list promotion**

### API Testing with Postman

Import the following collection structure:

```json
{
  "name": "RailBooker API",
  "requests": [
    {
      "name": "Register",
      "method": "POST",
      "url": "{{base_url}}/api/auth/register"
    },
    {
      "name": "Login",
      "method": "POST",
      "url": "{{base_url}}/api/auth/login"
    },
    {
      "name": "Get Trains",
      "method": "GET",
      "url": "{{base_url}}/api/trains"
    }
  ]
}
```

### Load Testing

Use tools like Apache Bench or Artillery:

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 100 http://localhost:3000/api/trains
```

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Stateless token-based auth
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Sanitization of user inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **Rate Limiting**: Prevent brute force attacks (recommended: express-rate-limit)
- **Helmet.js**: Security headers (add for production)

### Recommended for Production:

```bash
npm install helmet express-rate-limit
```

Add to `server.js`:
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

---

## 🚀 Performance Optimization

1. **Redis Caching**: Reduces database queries
2. **Database Indexing**: Optimized Prisma schema with indexes
3. **Connection Pooling**: Prisma connection pool
4. **Lazy Loading**: Frontend loads data on demand
5. **CDN for Static Assets**: Serve CSS/JS from CDN in production
6. **Gzip Compression**: Compress responses

### Add Compression:
```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

---

## 🌐 Internationalization (i18n)

Supported languages:
- English (en)
- Hindi (hi)
- Spanish (es)
- French (fr)

Add new language in `public/js/translations.js`:

```javascript
const translations = {
  en: { /* English translations */ },
  hi: { /* Hindi translations */ },
  es: { /* Spanish translations */ }
};
```

---

## 📈 Monitoring & Logging

### Recommended Tools

- **PM2**: Process manager with monitoring
  ```bash
  npm install -g pm2
  pm2 start server.js --name railbooker
  pm2 monit
  ```

- **Winston**: Advanced logging
  ```bash
  npm install winston
  ```

- **Prometheus + Grafana**: Metrics and dashboards

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Add comments for complex logic
- Write meaningful commit messages

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Yug Arora**
- GitHub: [@yug005](https://github.com/yug005)
- Repository: [bee_project](https://github.com/yug005/bee_project)

---

## 🙏 Acknowledgments

- Express.js community
- Prisma team
- Socket.IO developers
- Tailwind CSS
- Redis Labs
- PostgreSQL community

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@railbooker.com (if applicable)
- Documentation: [Wiki](https://github.com/yug005/bee_project/wiki)

---

## 🗺 Roadmap

### Upcoming Features
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] SMS notifications
- [ ] Multi-currency support
- [ ] Train delay tracking with live GPS
- [ ] Seat preference (window/aisle)
- [ ] Group booking feature
- [ ] Loyalty points system
- [ ] AI-powered route suggestions

---

## 📸 Screenshots

### User Dashboard
![User Dashboard](./docs/screenshots/dashboard.png)

### Booking Interface
![Booking](./docs/screenshots/booking.png)

### Admin Panel
![Admin Panel](./docs/screenshots/admin.png)

---

**Happy Coding! 🚂✨**
