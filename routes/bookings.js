const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authMiddleware');
const QRCode = require('qrcode');
const { 
    startBookingConfirmation, 
    calculateWaitingPosition, 
    hasAvailableSeats,
    processWaitingList,
    notifyWaitingListUpdates
} = require('../services/waitingListProcessor');

const prisma = new PrismaClient();

// Get user's bookings (protected)
router.get('/bookings', authenticateToken, async (req, res) => {
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
});

// Book a seat (protected) - With Waiting List Support
router.post('/trains/:id/book', authenticateToken, async (req, res) => {
    const trainId = parseInt(req.params.id);
    const userId = req.user.id;
    const { journeyDate, passengerName, passengerAge, seatNumber, coachNumber, allowWaitingList = true } = req.body;

    // Validate required fields
    if (!journeyDate || !passengerName || !passengerAge || !seatNumber || !coachNumber) {
        return res.status(400).json({ error: 'All booking details are required (journey date, passenger info, and seat selection).' });
    }

    try {
        let booking;
        let bookingStatus = 'Confirmed';
        let waitingPosition = null;
        
        await prisma.$transaction(async (tx) => {
            const train = await tx.train.findUnique({ where: { id: trainId } });
            
            if (!train) {
                return res.status(404).json({ error: 'Train not found.' });
            }

            // Check if seat is already booked for this train and date
            const seatBooking = await tx.booking.findFirst({ 
                where: { 
                    trainId,
                    journeyDate: new Date(journeyDate),
                    seatNumber,
                    coachNumber,
                    status: { in: ['Confirmed', 'RAC'] }
                } 
            });

            if (seatBooking) {
                return res.status(409).json({ error: 'This seat is already booked for the selected date.' });
            }

            // Check if user already has a booking
            const existingBooking = await tx.booking.findFirst({ 
                where: { 
                    userId, 
                    trainId,
                    journeyDate: new Date(journeyDate)
                } 
            });

            if (existingBooking) {
                return res.status(409).json({ error: 'You already have a booking for this train on this date.' });
            }

            // Determine booking status based on seat availability
            if (train.availableSeats > 0) {
                // Seats available - confirm immediately
                bookingStatus = 'Confirmed';
                
                await tx.train.update({
                    where: { id: trainId },
                    data: { availableSeats: { decrement: 1 } }
                });
            } else {
                // No seats - add to waiting list
                if (!allowWaitingList) {
                    return res.status(409).json({ error: 'No seats available and waiting list not allowed.' });
                }
                
                bookingStatus = 'Waiting';
                waitingPosition = await calculateWaitingPosition(trainId, journeyDate);
            }
            
            // Create booking
            booking = await tx.booking.create({ 
                data: { 
                    userId, 
                    trainId,
                    journeyDate: new Date(journeyDate),
                    passengerName,
                    passengerAge: parseInt(passengerAge),
                    seatNumber,
                    coachNumber,
                    status: bookingStatus,
                    waitingPosition: waitingPosition
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
        });

        if (!booking) {
            return res.status(500).json({ error: 'Booking creation failed' });
        }

        // Get queue, cache and io from app
        const queue = req.app.get('queue');
        const cache = req.app.get('cache');
        const io = req.app.get('io');

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

            // Update booking with QR code
            booking = await prisma.booking.update({
                where: { id: booking.id },
                data: { 
                    qrCode: qrCodeDataURL,
                    confirmedAt: new Date()
                },
                include: {
                    train: {
                        include: {
                            fromStation: true,
                            toStation: true
                        }
                    },
                    user: true
                }
            });

            // Send confirmation email if user has email
            if (queue && booking.user && booking.user.email) {
                try {
                    await queue.addEmailJob(
                        booking.user.email,
                        'bookingConfirmation',
                        {
                            booking: booking,
                            train: booking.train,
                            qrCode: qrCodeDataURL
                        }
                    );
                    console.log(`📧 Ticket confirmation email queued for ${booking.user.email}`);
                } catch (emailError) {
                    console.error('Email queueing failed:', emailError.message);
                    // Don't fail the booking if email fails
                }
            }
        }

        // Invalidate trains cache
        if (cache) {
            await cache.del('trains:all');
            await cache.del(`train:${trainId}`);
        }

        // Only start confirmation process for waiting list bookings
        if (bookingStatus === 'Waiting' && waitingPosition) {
            // For waiting list, don't auto-confirm - wait for a cancellation
            console.log(`📋 Booking ${booking.pnrNumber} added to waiting list at position WL${waitingPosition}`);
        }

        // Emit initial WebSocket event
        if (io) {
            io.emit('booking-created', { 
                bookingId: booking.id,
                pnrNumber: booking.pnrNumber,
                trainId, 
                userId, 
                status: bookingStatus,
                waitingPosition: waitingPosition,
                message: bookingStatus === 'Waiting' && waitingPosition 
                    ? `Your booking is in waiting list. Position: WL${waitingPosition}`
                    : '🎉 Your booking is confirmed!',
                availableSeats: booking.train.availableSeats,
                timestamp: new Date() 
            });
        }

        // Add booking processing job to queue
        if (queue) {
            queue.addBookingJob(booking.id, userId, trainId)
                .catch(err => console.error('Booking queue error:', err.message));
        }

        res.status(201).json({ 
            message: bookingStatus === 'Waiting' && waitingPosition
                ? `Booking created with waiting list position WL${waitingPosition}. You will be notified when confirmed.`
                : '🎉 Booking confirmed! Your ticket is ready.',
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
        res.status(500).json({ error: 'An error occurred while creating the booking.' });
    }
});

// Cancel a booking (protected) - With Automatic Waiting List Processing
router.delete('/bookings/:id', authenticateToken, async (req, res) => {
    const bookingId = parseInt(req.params.id);
    const userId = req.user.id;

    try {
        let booking;
        let train;
        
        await prisma.$transaction(async (tx) => {
            booking = await tx.booking.findUnique({ 
                where: { id: bookingId },
                include: {
                    train: true
                }
            });

            if (!booking) {
                return res.status(404).json({ error: 'Booking not found.' });
            }

            if (booking.userId !== userId) {
                return res.status(403).json({ error: 'You do not have permission to cancel this booking.' });
            }

            train = await tx.train.findUnique({ where: { id: booking.trainId } });

            // Delete the booking
            await tx.booking.delete({ where: { id: bookingId } });
            
            // Increase available seats only if booking was confirmed (and not exceeding total)
            if (booking.status === 'Confirmed' || booking.status === 'RAC') {
                // Make sure we don't exceed total seats
                if (train.availableSeats < train.totalSeats) {
                    await tx.train.update({
                        where: { id: train.id },
                        data: { availableSeats: { increment: 1 } }
                    });
                } else {
                    console.log(`⚠️ Warning: Train ${train.id} already at max capacity. Not incrementing seats.`);
                }
            }
        });

        // Get io, cache, and queue
        const io = req.app.get('io');
        const cache = req.app.get('cache');
        const queue = req.app.get('queue');

        // Emit cancellation event
        if (io) {
            io.emit('booking-cancelled', { 
                trainId: booking.trainId, 
                userId, 
                bookingId,
                pnrNumber: booking.pnrNumber,
                action: 'cancelled',
                availableSeats: train.availableSeats + 1,
                timestamp: new Date() 
            });
        }

        // Process waiting list if booking was confirmed (seat is now available)
        if (booking.status === 'Confirmed' || booking.status === 'RAC') {
            console.log(`\n🎯 Seat available! Processing waiting list for train ${booking.trainId}`);
            
            // Wait a moment for transaction to complete
            setTimeout(async () => {
                const confirmedBooking = await processWaitingList(
                    booking.trainId, 
                    booking.journeyDate, 
                    io, 
                    cache, 
                    queue
                );
                
                if (confirmedBooking) {
                    console.log(`✅ Auto-confirmed booking from waiting list: ${confirmedBooking.pnrNumber}`);
                    
                    // Notify remaining people in waiting list about updated positions
                    await notifyWaitingListUpdates(booking.trainId, booking.journeyDate, io);
                }
            }, 1000);
        }

        // Invalidate cache
        if (cache) {
            await cache.del('trains:all');
            await cache.del(`train:${booking.trainId}`);
        }

        res.json({ 
            message: 'Booking cancelled successfully!',
            willProcessWaitingList: booking.status === 'Confirmed' || booking.status === 'RAC'
        });
        
    } catch (e) {
        console.error('Cancellation error:', e);
        res.status(500).json({ error: 'An error occurred during cancellation.' });
    }
});

module.exports = router;