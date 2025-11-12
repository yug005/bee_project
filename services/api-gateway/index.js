require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const { createRedisClient, cache } = require('../shared/redisClient');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const TRAIN_SERVICE_URL = process.env.TRAIN_SERVICE_URL || 'http://localhost:3002';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';

// Initialize Redis
createRedisClient();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// Health check
app.get('/api/health', async (req, res) => {
    const services = {
        gateway: 'healthy',
        auth: 'unknown',
        train: 'unknown',
        booking: 'unknown',
        notification: 'unknown'
    };

    // Check each service
    try {
        await axios.get(`${AUTH_SERVICE_URL}/health`, { timeout: 2000 });
        services.auth = 'healthy';
    } catch (error) {
        services.auth = 'unhealthy';
    }

    try {
        await axios.get(`${TRAIN_SERVICE_URL}/health`, { timeout: 2000 });
        services.train = 'healthy';
    } catch (error) {
        services.train = 'unhealthy';
    }

    try {
        await axios.get(`${BOOKING_SERVICE_URL}/health`, { timeout: 2000 });
        services.booking = 'healthy';
    } catch (error) {
        services.booking = 'unhealthy';
    }

    try {
        await axios.get(`${NOTIFICATION_SERVICE_URL}/health`, { timeout: 2000 });
        services.notification = 'healthy';
    } catch (error) {
        services.notification = 'unhealthy';
    }

    const allHealthy = Object.values(services).every(s => s === 'healthy');
    res.status(allHealthy ? 200 : 503).json({ services });
});

// Get current server time
app.get('/api/time', (req, res) => {
    res.json({ currentTime: new Date().toLocaleTimeString() });
});

// --- Route Proxying ---

// Auth routes
app.use('/api/register', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/register': '/register' }
}));

app.use('/api/login', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/login': '/login' }
}));

app.use('/api/profile', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/profile': '/profile' }
}));

app.use('/api/users', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/users' }
}));

// Train/Location routes
app.use('/api/states', createProxyMiddleware({
    target: TRAIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/states': '/states' }
}));

app.use('/api/cities', createProxyMiddleware({
    target: TRAIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/cities': '/cities' }
}));

app.use('/api/trains', createProxyMiddleware({
    target: TRAIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/trains': '/trains' }
}));

// Booking routes
app.use('/api/bookings', createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/bookings': '/bookings' }
}));

// Notification routes (admin only in production)
app.use('/api/notifications', createProxyMiddleware({
    target: NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/notifications': '' }
}));

// Admin routes - for now, route to train service (can be moved to dedicated admin service later)
app.use('/api/admin', createProxyMiddleware({
    target: TRAIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/admin': '/admin' }
}));

// --- WebSocket Setup ---
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // Handle booking events
    socket.on('new-booking', async (bookingData) => {
        console.log('📦 New booking received:', bookingData);
        
        // Broadcast to all connected clients
        io.emit('booking-update', bookingData);
    });

    // Handle train updates
    socket.on('train-update', async (trainData) => {
        console.log('🚂 Train update received:', trainData);
        
        // Invalidate cache for this train
        await cache.del(`train:${trainData.trainId}`);
        
        io.emit('train-status-update', trainData);
    });

    // Send real-time updates
    socket.on('request-live-data', async () => {
        try {
            // Try to get from cache first
            let trains = await cache.get('trains:all');
            
            if (!trains) {
                // If not in cache, fetch from Train Service
                const response = await axios.get(`${TRAIN_SERVICE_URL}/trains`, {
                    headers: socket.handshake.headers
                });
                trains = response.data;
                // Cache for 5 minutes
                await cache.set('trains:all', trains, 300);
            }
            
            socket.emit('live-train-data', trains);
        } catch (error) {
            socket.emit('error', { message: 'Failed to fetch live data' });
        }
    });

    socket.on('disconnect', () => {
        console.log('🔌 User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Gateway error:', err);
    res.status(500).json({ error: 'Internal gateway error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
server.listen(PORT, () => {
    console.log(`\n🚪 API Gateway running on http://localhost:${PORT}`);
    console.log(`\n📡 Routing to microservices:`);
    console.log(`   - Auth Service: ${AUTH_SERVICE_URL}`);
    console.log(`   - Train Service: ${TRAIN_SERVICE_URL}`);
    console.log(`   - Booking Service: ${BOOKING_SERVICE_URL}`);
    console.log(`   - Notification Service: ${NOTIFICATION_SERVICE_URL}`);
    console.log(`\n✨ WebSocket server ready\n`);
});

module.exports = app;
