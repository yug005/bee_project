// Imports
require('dotenv').config(); 
const express = require('express');
const path = require('path');
const http = require('http');
const session = require('express-session');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { PrismaClient } = require('@prisma/client');
const { seedDatabase } = require('./utils/seed');
const { verifyEmailConfig } = require('./config/email');
const { redisClient, redisSubscriber, redisPublisher, cache, pubsub } = require('./config/redis');
const { queueHelpers } = require('./config/queue');
const passport = require('./config/passport');

//  routes
const userRoutes = require('./routes/users');
const trainRoutes = require('./routes/trains');
const bookingRoutes = require('./routes/bookings');
const locationRoutes = require('./routes/locations');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

// Initialization 
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Setup Redis adapter for Socket.io (for horizontal scaling)
io.adapter(createAdapter(redisPublisher, redisSubscriber));

// Make Redis cache and queue available to routes
app.set('cache', cache);
app.set('queue', queueHelpers);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints ---
//endpoinys\

// Use the imported route modules
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', trainRoutes);
app.use('/api', bookingRoutes);
app.use('/api', locationRoutes);
app.use('/api', adminRoutes);

// Get current server time 
app.get('/api/time', (req, res) => {
    res.json({ currentTime: new Date().toLocaleTimeString() });
});

// --- WebSocket Setup ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle booking events
    socket.on('new-booking', async (bookingData) => {
        console.log('New booking received:', bookingData);
        
        // Publish to Redis Pub/Sub for cross-server communication
        await pubsub.publish('booking-updates', bookingData);
        
        // Broadcast to all connected clients (via Redis adapter)
        io.emit('booking-update', bookingData);
    });

    // Handle train updates
    socket.on('train-update', async (trainData) => {
        console.log('Train update received:', trainData);
        
        // Invalidate cache for this train
        await cache.del(`train:${trainData.trainId}`);
        
        // Publish to Redis Pub/Sub
        await pubsub.publish('train-updates', trainData);
        
        io.emit('train-status-update', trainData);
    });

    // Send real-time updates
    socket.on('request-live-data', async () => {
        try {
            // Try to get from cache first
            let trains = await cache.get('trains:all');
            
            if (!trains) {
                // If not in cache, fetch from database
                trains = await prisma.train.findMany();
                // Cache for 5 minutes
                await cache.set('trains:all', trains, 300);
            }
            
            socket.emit('live-train-data', trains);
        } catch (error) {
            socket.emit('error', { message: 'Failed to fetch live data' });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Subscribe to Redis Pub/Sub channels
pubsub.subscribe('booking-updates', (data) => {
    console.log('📡 Received booking update via Pub/Sub:', data);
    // Handle cross-server booking updates
});

pubsub.subscribe('train-updates', (data) => {
    console.log('📡 Received train update via Pub/Sub:', data);
    // Handle cross-server train updates
});

// Make io available to routes
app.set('io', io);

// --- Server Startup ---
const startServer = async () => {
    try {
        await seedDatabase(prisma);
        
        // Verify email configuration (non-blocking)
        verifyEmailConfig()
            .then(() => console.log('📧 Email system ready for ticket confirmations'))
            .catch(err => {
                console.warn('⚠️ Email system disabled:', err.message);
                console.warn('💡 Configure EMAIL_USER and EMAIL_PASS in .env to enable email notifications');
            });
        
        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`WebSocket server is ready`);
        });
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
};

startServer();