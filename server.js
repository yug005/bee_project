// Imports
require('dotenv').config(); 
const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { seedTrains } = require('./utils/seed');

//  routes
const userRoutes = require('./routes/users');
const trainRoutes = require('./routes/trains');
const bookingRoutes = require('./routes/bookings');

// Initialization 
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints ---

// Use the imported route modules
app.use('/api', userRoutes);
app.use('/api', trainRoutes);
app.use('/api', bookingRoutes);

// Get current server time 
app.get('/api/time', (req, res) => {
    res.json({ currentTime: new Date().toLocaleTimeString() });
});

// --- Server Startup ---
const startServer = async () => {
    await seedTrains(prisma);
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();