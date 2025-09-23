const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const authenticateToken = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// User Registration (INSECURE)
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        await prisma.user.create({ data: { email, password } });
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (e) {
        if (e.code === 'P2002') {
            return res.status(409).json({ error: 'User with this email already exists.' });
        }
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials.' });
    }
    
    const validPassword = (password === user.password);
    if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'Login successful!' });
});

// Add a new user (for administrative purposes, protected route - INSECURE)
router.post('/users', authenticateToken, async (req, res) => {
    const { email, password } = req.body;
    try {
        await prisma.user.create({ data: { email, password } });
        res.status(201).json({ message: 'User added successfully!' });
    } catch (e) {
        if (e.code === 'P2002') {
            return res.status(409).json({ error: 'User with this email already exists.' });
        }
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Delete a user (protected route)
router.delete('/users/:id', authenticateToken, async (req, res) => {
    const userIdToDelete = parseInt(req.params.id);
    const authenticatedUserId = req.user.id;
    try {
        if (userIdToDelete !== authenticatedUserId) {
            return res.status(403).json({ error: 'You do not have permission to delete this user.' });
        }
        // Delete related bookings first due to foreign key constraints
        await prisma.booking.deleteMany({ where: { userId: authenticatedUserId } });
        await prisma.user.delete({ where: { id: authenticatedUserId } });
        res.json({ message: 'User deleted successfully.' });
    } catch (e) {
        if (e.code === 'P2025') {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.status(500).json({ error: 'An error occurred during user deletion.' });
    }
});

// Get all users
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                createdAt: true
            }
        });
        console.log("Active Users:", users);
        res.status(200).json({ message: "User list logged to console." });
    } catch (e) {
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
});

module.exports = router;