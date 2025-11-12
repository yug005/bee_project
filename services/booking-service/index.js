require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const QRCode = require('qrcode');
const getPrismaClient = require('../shared/prismaClient');
const { cache, createRedisClient } = require('../shared/redisClient');
const { publishMessage, connectQueue } = require('../shared/messageQueue');

const app = express();
const PORT = process.env.BOOKING_SERVICE_PORT || 3003;
const prisma = getPrismaClient();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const TRAIN_SERVICE_URL = process.env.TRAIN_SERVICE_URL || 'http://localhost:3002';

// Initialize Redis and Queue
createRedisClient();
connectQueue();

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
async function authenticateRequest(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/verify-token`, { token });
        req.user = response.data.user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'booking-service' });
});

// Helper: Calculate waiting list position
async function calculateWaitingPosition(trainId, journeyDate) {
    const waitingCount = await prisma.booking.count({
        where: {
            trainId,
            journeyDate: new Date(journeyDate),
            status: 'Waiting'
        }
    });
    return waitingCount + 1;
}

// Helper: Process waiting list
async function processWaitingList(trainId, journeyDate) {
    try {
        const train = await prisma.train.findUnique({ where: { id: trainId } });
        
        if (!train || train.availableSeats <= 0) {
            return null;
        }

        // Get the first waiting list booking
        const waitingBooking = await prisma.booking.findFirst({
            where: {
                trainId,
                journeyDate: new Date(journeyDate),
                status: 'Waiting'
            },
            orderBy: {
                waitingPosition: 'asc'
            },
            include: {
                user: true,
                train: {
                    include: {
                        fromStation: true,
                        toStation: true
                    }
                }
            }
        });

        if (!waitingBooking) {
            return null;
        }

        // Confirm the booking
        const confirmedBooking = await prisma.$transaction(async (tx) => {
            // Update booking status
            const updated = await tx.booking.update({
                where: { id: waitingBooking.id },
                data: {
                    status: 'Confirmed',
                    waitingPosition: null,
                    confirmedAt: new Date()
                },
                include: {
                    user: true,
                    train: {
                        include: {
                            fromStation: true,
                            toStation: true
                        }
                    }
                }
            });

            // Decrease available seats
            await tx.train.update({
                where: { id: trainId },
                data: { availableSeats: { decrement: 1 } }
            });

            return updated;
        });

        // Generate QR code
        const qrData = JSON.stringify({
            pnr: confirmedBooking.pnrNumber,
            trainNumber: confirmedBooking.train.trainNumber,
            trainName: confirmedBooking.train.name,
            passenger: confirmedBooking.passengerName,
            from: confirmedBooking.train.fromStation?.name || 'N/A',
            to: confirmedBooking.train.toStation?.name || 'N/A',
            date: confirmedBooking.journeyDate.toISOString(),
            seat: `${confirmedBooking.coachNumber}-${confirmedBooking.seatNumber}`,
            bookingId: confirmedBooking.id
        });

        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2
        });

        // Update booking with QR code
        await prisma.booking.update({
            where: { id: confirmedBooking.id },
            data: { qrCode: qrCodeDataURL }
        });

        // Send email notification
        if (confirmedBooking.user && confirmedBooking.user.email) {
            await publishMessage('email-queue', {
                to: confirmedBooking.user.email,
                type: 'waitingListConfirmed',
                data: {
                    booking: confirmedBooking,
                    train: confirmedBooking.train,
                    qrCode: qrCodeDataURL
                }
            });
        }

        // Invalidate cache
        await cache.del(`train:${trainId}`);
        await cache.del('trains:all');

        return confirmedBooking;
    } catch (error) {
        console.error('Waiting list processing error:', error);
        return null;
    }
}

// Get user's bookings
app.get('/bookings', authenticateRequest, async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.user.id },
            include: {
                train: {
                    include: {
                        fromStation: {
                            include: {
                                city: {
                                    include: {
                                        state: true
                                    }
                                }
                            }
                        },
                        toStation: {
                            include: {
                                city: {
                                    include: {
                                        state: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                journeyDate: 'asc'
            }
        });

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get booking by ID
app.get('/bookings/:id', authenticateRequest, async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                train: {
                    include: {
                        fromStation: true,
                        toStation: true
                    }
                }
            }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});

// Create booking
app.post('/bookings', authenticateRequest, async (req, res) => {
    const { trainId, journeyDate, passengerName, passengerAge, seatNumber, coachNumber, allowWaitingList = true } = req.body;
    const userId = req.user.id;

    // Validate
    if (!trainId || !journeyDate || !passengerName || !passengerAge || !seatNumber || !coachNumber) {
        return res.status(400).json({ error: 'All booking details are required' });
    }

    try {
        let booking;
        let bookingStatus = 'Confirmed';
        let waitingPosition = null;

        await prisma.$transaction(async (tx) => {
            const train = await tx.train.findUnique({ where: { id: parseInt(trainId) } });

            if (!train) {
                throw new Error('Train not found');
            }

            // Check if seat is already booked
            const seatBooking = await tx.booking.findFirst({
                where: {
                    trainId: parseInt(trainId),
                    journeyDate: new Date(journeyDate),
                    seatNumber,
                    coachNumber,
                    status: { in: ['Confirmed', 'RAC'] }
                }
            });

            if (seatBooking) {
                throw new Error('Seat already booked');
            }

            // Check existing booking for this user
            const existingBooking = await tx.booking.findFirst({
                where: {
                    userId,
                    trainId: parseInt(trainId),
                    journeyDate: new Date(journeyDate)
                }
            });

            if (existingBooking) {
                throw new Error('Already booked');
            }

            // Determine status
            if (train.availableSeats > 0) {
                bookingStatus = 'Confirmed';
            } else {
                if (!allowWaitingList) {
                    throw new Error('No seats available');
                }
                bookingStatus = 'Waiting';
                waitingPosition = await calculateWaitingPosition(parseInt(trainId), journeyDate);
            }

            // Create booking
            booking = await tx.booking.create({
                data: {
                    userId,
                    trainId: parseInt(trainId),
                    journeyDate: new Date(journeyDate),
                    passengerName,
                    passengerAge: parseInt(passengerAge),
                    seatNumber,
                    coachNumber,
                    status: bookingStatus,
                    waitingPosition: waitingPosition,
                    confirmedAt: bookingStatus === 'Confirmed' ? new Date() : null
                },
                include: {
                    train: {
                        include: {
                            fromStation: true,
                            toStation: true
                        }
                    }
                }
            });

            // Update seats if confirmed
            if (bookingStatus === 'Confirmed') {
                await tx.train.update({
                    where: { id: parseInt(trainId) },
                    data: { availableSeats: { decrement: 1 } }
                });
            }
        });

        // Generate QR code for confirmed bookings
        if (bookingStatus === 'Confirmed') {
            const qrData = JSON.stringify({
                pnr: booking.pnrNumber,
                trainNumber: booking.train.trainNumber,
                trainName: booking.train.name,
                passenger: booking.passengerName,
                from: booking.train.fromStation?.name || 'N/A',
                to: booking.train.toStation?.name || 'N/A',
                date: booking.journeyDate.toISOString(),
                seat: `${booking.coachNumber}-${booking.seatNumber}`,
                bookingId: booking.id
            });

            const qrCodeDataURL = await QRCode.toDataURL(qrData, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                width: 300,
                margin: 2
            });

            await prisma.booking.update({
                where: { id: booking.id },
                data: { qrCode: qrCodeDataURL }
            });

            // Send confirmation email
            const userResponse = await axios.get(`${AUTH_SERVICE_URL}/users/${userId}`);
            if (userResponse.data.user && userResponse.data.user.email) {
                await publishMessage('email-queue', {
                    to: userResponse.data.user.email,
                    type: 'bookingConfirmation',
                    data: {
                        booking: booking,
                        train: booking.train,
                        qrCode: qrCodeDataURL
                    }
                });
            }
        }

        // Invalidate cache
        await cache.del(`train:${trainId}`);
        await cache.del('trains:all');

        res.status(201).json({
            message: bookingStatus === 'Waiting'
                ? `Booking created with waiting list position WL${waitingPosition}`
                : 'Booking confirmed successfully',
            booking: {
                id: booking.id,
                pnrNumber: booking.pnrNumber,
                status: bookingStatus,
                waitingPosition: waitingPosition,
                passengerName: booking.passengerName,
                trainName: booking.train.name,
                journeyDate: booking.journeyDate
            }
        });
    } catch (error) {
        console.error('Booking error:', error);
        if (error.message === 'Train not found') {
            return res.status(404).json({ error: 'Train not found' });
        }
        if (error.message === 'Seat already booked') {
            return res.status(409).json({ error: 'This seat is already booked for the selected date' });
        }
        if (error.message === 'Already booked') {
            return res.status(409).json({ error: 'You already have a booking for this train on this date' });
        }
        if (error.message === 'No seats available') {
            return res.status(409).json({ error: 'No seats available and waiting list not allowed' });
        }
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Cancel booking
app.delete('/bookings/:id', authenticateRequest, async (req, res) => {
    const bookingId = parseInt(req.params.id);
    const userId = req.user.id;

    try {
        let booking;

        await prisma.$transaction(async (tx) => {
            booking = await tx.booking.findUnique({
                where: { id: bookingId },
                include: { train: true }
            });

            if (!booking) {
                throw new Error('Not found');
            }

            if (booking.userId !== userId) {
                throw new Error('Forbidden');
            }

            await tx.booking.delete({ where: { id: bookingId } });

            // Increase available seats if confirmed
            if (booking.status === 'Confirmed' || booking.status === 'RAC') {
                const train = await tx.train.findUnique({ where: { id: booking.trainId } });
                if (train.availableSeats < train.totalSeats) {
                    await tx.train.update({
                        where: { id: booking.trainId },
                        data: { availableSeats: { increment: 1 } }
                    });
                }
            }
        });

        // Process waiting list if booking was confirmed
        if (booking.status === 'Confirmed' || booking.status === 'RAC') {
            setTimeout(async () => {
                const confirmedBooking = await processWaitingList(booking.trainId, booking.journeyDate);
                if (confirmedBooking) {
                    console.log(`✅ Auto-confirmed booking from waiting list: ${confirmedBooking.pnrNumber}`);
                }
            }, 1000);
        }

        // Invalidate cache
        await cache.del(`train:${booking.trainId}`);
        await cache.del('trains:all');

        res.json({
            message: 'Booking cancelled successfully',
            willProcessWaitingList: booking.status === 'Confirmed' || booking.status === 'RAC'
        });
    } catch (error) {
        console.error('Cancellation error:', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: 'Booking not found' });
        }
        if (error.message === 'Forbidden') {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🎫 Booking Service running on http://localhost:${PORT}`);
});

module.exports = app;
