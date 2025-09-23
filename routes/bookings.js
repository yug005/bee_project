// const express = require('express');
// const router = express.Router();
// const prisma = require('../config/database');
// const authenticateToken = require('../middleware/authMiddleware');

// // Get user's bookings (protected)
// router.get('/bookings', authenticateToken, async (req, res) => {
//     const bookings = await prisma.booking.findMany({ where: { userId: req.user.id } });
//     res.json(bookings);
// });

// // Book a seat (protected)
// router.post('/trains/:id/book', authenticateToken, async (req, res) => {
//     const trainId = parseInt(req.params.id);
//     const userId = req.user.id;

//     try {
//         await prisma.$transaction(async (tx) => {
//             const train = await tx.train.findUnique({ where: { id: trainId } });
//             const existingBooking = await tx.booking.findFirst({ where: { userId, trainId } });

//             if (!train) {
//                 return res.status(404).json({ error: 'Train not found.' });
//             }

//             if (existingBooking) {
//                 return res.status(409).json({ error: 'Seat already booked for this train.' });
//             }

//             if (train.availableSeats > 0) {
//                 await tx.train.update({
//                     where: { id: trainId },
//                     data: { availableSeats: { decrement: 1 } }
//                 });
//                 const booking = await tx.booking.create({ data: { userId, trainId } });
//                 res.status(201).json({ message: 'Seat booked successfully!', booking });
//             } else {
//                 res.status(409).json({ error: 'No seats available.' });
//             }
//         });
//     } catch (e) {
//         res.status(500).json({ error: 'An error occurred during booking.' });
//     }
// });

// // Cancel a booking (protected)
// router.delete('/bookings/:id', authenticateToken, async (req, res) => {
//     const bookingId = parseInt(req.params.id);
//     const userId = req.user.id;

//     try {
//         await prisma.$transaction(async (tx) => {
//             const booking = await tx.booking.findUnique({ where: { id: bookingId } });

//             if (!booking) {
//                 return res.status(404).json({ error: 'Booking not found.' });
//             }

//             if (booking.userId !== userId) {
//                 return res.status(403).json({ error: 'You do not have permission to cancel this booking.' });
//             }

//             const train = await tx.train.findUnique({ where: { id: booking.trainId } });

//             await tx.booking.delete({ where: { id: bookingId } });
//             await tx.train.update({
//                 where: { id: train.id },
//                 data: { availableSeats: { increment: 1 } }
//             });

//             res.json({ message: 'Booking canceled successfully!' });
//         });
//     } catch (e) {
//         res.status(500).json({ error: 'An error occurred during cancellation.' });
//     }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const authenticateToken = require('../middleware/authMiddleware');

// Get user's bookings (protected)
router.get('/bookings', authenticateToken, async (req, res) => {
    const bookings = await prisma.booking.findMany({ where: { userId: req.user.id } });
    res.json(bookings);
});

// Book a seat (protected)
router.post('/trains/:id/book', authenticateToken, async (req, res) => {
    const trainId = parseInt(req.params.id);
    const userId = req.user.id;

    try {
        await prisma.$transaction(async (tx) => {
            const train = await tx.train.findUnique({ where: { id: trainId } });
            const existingBooking = await tx.booking.findFirst({ where: { userId, trainId } });

            if (!train) {
                return res.status(404).json({ error: 'Train not found.' });
            }

            if (existingBooking) {
                return res.status(409).json({ error: 'Seat already booked for this train.' });
            }

            if (train.availableSeats > 0) {
                await tx.train.update({
                    where: { id: trainId },
                    data: { availableSeats: { decrement: 1 } }
                });
                const booking = await tx.booking.create({ data: { userId, trainId } });
                res.status(201).json({ message: 'Seat booked successfully!', booking });
            } else {
                res.status(409).json({ error: 'No seats available.' });
            }
        });
    } catch (e) {
        res.status(500).json({ error: 'An error occurred during booking.' });
    }
});

// Cancel a booking (protected)
router.delete('/bookings/:id', authenticateToken, async (req, res) => {
    const bookingId = parseInt(req.params.id);
    const userId = req.user.id;

    try {
        await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({ where: { id: bookingId } });

            if (!booking) {
                return res.status(404).json({ error: 'Booking not found.' });
            }

            if (booking.userId !== userId) {
                return res.status(403).json({ error: 'You do not have permission to cancel this booking.' });
            }

            const train = await tx.train.findUnique({ where: { id: booking.trainId } });

            await tx.booking.delete({ where: { id: bookingId } });
            await tx.train.update({
                where: { id: train.id },
                data: { availableSeats: { increment: 1 } }
            });

            res.json({ message: 'Booking canceled successfully!' });
        });
    } catch (e) {
        res.status(500).json({ error: 'An error occurred during cancellation.' });
    }
});

module.exports = router;