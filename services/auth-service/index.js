require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const getPrismaClient = require('../shared/prismaClient');
const { generateToken } = require('../shared/authMiddleware');
const { authenticateToken } = require('../shared/authMiddleware');
const { cache, createRedisClient } = require('../shared/redisClient');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;
const prisma = getPrismaClient();

// Initialize Redis
createRedisClient();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'auth-service' });
});

// User Registration
app.post('/register', async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ 
            where: { email } 
        });

        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
                role: 'user'
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        // Cache user data
        await cache.set(`user:${user.id}`, {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }, 3600); // 1 hour

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get User Profile (Protected)
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        // Try cache first
        let user = await cache.get(`user:${req.user.id}`);

        if (!user) {
            // Fetch from database
            user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Cache for future requests
            await cache.set(`user:${req.user.id}`, user, 3600);
        }

        res.json({ user });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update User Profile (Protected)
app.put('/profile', authenticateToken, async (req, res) => {
    const { name, email } = req.body;

    try {
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });

        // Invalidate cache
        await cache.del(`user:${req.user.id}`);

        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Profile update error:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Email already in use' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify Token (Internal endpoint for other services)
app.post('/verify-token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }

    const { verifyToken } = require('../shared/authMiddleware');
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ valid: true, user: decoded });
});

// Get User by ID (Internal endpoint for other services)
app.get('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Try cache first
        let user = await cache.get(`user:${userId}`);

        if (!user) {
            user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            await cache.set(`user:${userId}`, user, 3600);
        }

        res.json({ user });
    } catch (error) {
        console.error('User fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🔐 Auth Service running on http://localhost:${PORT}`);
});

module.exports = app;
