const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const authenticateToken = require('../middleware/authMiddleware');

// Add a new train (for administrative purposes, protected route)
router.post('/trains', authenticateToken, async (req, res) => {
    const { name, source, destination, totalSeats, time } = req.body;
    try {
        const newTrain = await prisma.train.create({
            data: {
                name,
                source,
                destination,
                totalSeats,
                availableSeats: totalSeats,
                time
            }
        });
        res.status(201).json({ message: 'Train added successfully!', train: newTrain });
    } catch (e) {
        res.status(500).json({ error: 'An error occurred while adding the train.' });
    }
});

// Delete a train (for administrative purposes, protected route)
router.delete('/trains/:id', authenticateToken, async (req, res) => {
    const trainId = parseInt(req.params.id);
    try {
        await prisma.$transaction(async (tx) => {
            // Delete related bookings first due to foreign key constraints
            await tx.booking.deleteMany({ where: { trainId: trainId } });
            await tx.train.delete({ where: { id: trainId } });
        });
        res.json({ message: 'Train deleted successfully.' });
    } catch (e) {
        if (e.code === 'P2025') {
            return res.status(404).json({ error: 'Train not found.' });
        }
        res.status(500).json({ error: 'An error occurred while deleting the train.' });
    }
});

// Get all trains (protected)
router.get('/trains', authenticateToken, async (req, res) => {
    const trains = await prisma.train.findMany();
    res.json(trains);
});

module.exports = router;