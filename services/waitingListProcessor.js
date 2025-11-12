const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');

const prisma = new PrismaClient();

// Store for tracking booking confirmations
const pendingConfirmations = new Map();

/**
 * Process a booking and add it to waiting list or confirm based on availability
 */
async function processBooking(bookingId, io, cache, queue) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
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

        if (!booking) {
            console.error('Booking not found:', bookingId);
            return;
        }

        console.log(`🎫 Processing booking ${booking.pnrNumber} - Current status: ${booking.status}`);

        // Emit initial status
        io.emit('booking-status-update', {
            bookingId: booking.id,
            pnrNumber: booking.pnrNumber,
            status: booking.status,
            message: 'Your booking is being processed...',
            waitingPosition: booking.waitingPosition
        });

        // Simulate processing time (2-5 seconds)
        const processingTime = Math.floor(Math.random() * 3000) + 2000;
        await sleep(processingTime);

        // Check if should move from Waiting to RAC
        if (booking.status === 'Waiting') {
            await updateToRAC(booking, io, queue);
            await sleep(5000); // Wait 5 seconds in RAC
        }

        // Check if should confirm from RAC
        if (booking.status === 'RAC' || booking.status === 'Waiting') {
            await confirmBooking(booking, io, cache, queue);
        }

    } catch (error) {
        console.error('Error processing booking:', error);
        io.emit('booking-status-update', {
            bookingId,
            status: 'Error',
            message: 'An error occurred while processing your booking'
        });
    }
}

/**
 * Update booking to RAC (Reservation Against Cancellation)
 */
async function updateToRAC(booking, io, queue) {
    try {
        console.log(`📋 Moving booking ${booking.pnrNumber} to RAC status`);

        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: { 
                status: 'RAC',
                waitingPosition: null // Clear waiting position when moving to RAC
            }
        });

        // Emit RAC status
        io.emit('booking-status-update', {
            bookingId: booking.id,
            pnrNumber: booking.pnrNumber,
            status: 'RAC',
            message: 'Your ticket is in RAC (Reservation Against Cancellation). Confirmation in progress...',
            progress: 60
        });

        console.log(`✅ Booking ${booking.pnrNumber} moved to RAC`);
        
        // Update booking in cache
        booking.status = 'RAC';
        
    } catch (error) {
        console.error('Error updating to RAC:', error);
    }
}

/**
 * Confirm a booking (move from Waiting/RAC to Confirmed)
 */
async function confirmBooking(booking, io, cache, queue) {
    try {
        console.log(`✅ Confirming booking ${booking.pnrNumber}`);

        // Generate QR code if not exists
        let qrCodeDataURL = booking.qrCode;
        if (!qrCodeDataURL || qrCodeDataURL === '') {
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

            qrCodeDataURL = await QRCode.toDataURL(qrData, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                width: 300,
                margin: 2
            });
        }

        // Update booking to confirmed
        const confirmedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: { 
                status: 'Confirmed',
                confirmedAt: new Date(),
                waitingPosition: null,
                qrCode: qrCodeDataURL
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

        // Decrement available seats since we're confirming from waiting list
        await prisma.train.update({
            where: { id: booking.trainId },
            data: { availableSeats: { decrement: 1 } }
        });

        // Emit confirmation status
        io.emit('booking-status-update', {
            bookingId: booking.id,
            pnrNumber: booking.pnrNumber,
            status: 'Confirmed',
            message: '🎉 Your ticket is CONFIRMED!',
            progress: 100,
            qrCode: qrCodeDataURL
        });

        console.log(`🎉 Booking ${booking.pnrNumber} CONFIRMED!`);

        // Send confirmation email via queue
        if (queue && confirmedBooking.user && confirmedBooking.user.email) {
            try {
                await queue.addEmailJob(
                    confirmedBooking.user.email,
                    'bookingConfirmation',
                    {
                        booking: confirmedBooking,
                        train: confirmedBooking.train,
                        qrCode: qrCodeDataURL
                    }
                );
                console.log(`📧 Ticket confirmation email queued for ${confirmedBooking.user.email}`);
            } catch (emailError) {
                console.error('Email queueing failed:', emailError.message);
                // Don't fail the confirmation if email fails
            }
        }

        // Invalidate cache
        if (cache) {
            await cache.del('trains:all');
            await cache.del(`train:${booking.trainId}`);
        }

        // Remove from pending confirmations
        pendingConfirmations.delete(booking.id);

    } catch (error) {
        console.error('Error confirming booking:', error);
        io.emit('booking-status-update', {
            bookingId: booking.id,
            status: 'Error',
            message: 'Failed to confirm booking. Please contact support.'
        });
    }
}

/**
 * Calculate waiting position based on existing bookings
 */
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

/**
 * Check if train has available seats
 */
async function hasAvailableSeats(trainId) {
    const train = await prisma.train.findUnique({
        where: { id: trainId }
    });
    return train && train.availableSeats > 0;
}

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Start processing a booking with automatic status progression
 */
function startBookingConfirmation(bookingId, io, cache, queue, delaySeconds = 20) {
    const delayMs = delaySeconds * 1000;
    
    console.log(`⏰ Scheduling confirmation for booking ${bookingId} in ${delaySeconds} seconds`);
    
    // Store the timeout
    const timeoutId = setTimeout(async () => {
        await processBooking(bookingId, io, cache, queue);
    }, delayMs);
    
    pendingConfirmations.set(bookingId, timeoutId);
    
    return timeoutId;
}

/**
 * Cancel a pending confirmation
 */
function cancelPendingConfirmation(bookingId) {
    const timeoutId = pendingConfirmations.get(bookingId);
    if (timeoutId) {
        clearTimeout(timeoutId);
        pendingConfirmations.delete(bookingId);
        console.log(`❌ Cancelled pending confirmation for booking ${bookingId}`);
        return true;
    }
    return false;
}

/**
 * Get all pending confirmations
 */
function getPendingConfirmations() {
    return Array.from(pendingConfirmations.keys());
}

/**
 * Process waiting list when a seat becomes available
 */
async function processWaitingList(trainId, journeyDate, io, cache, queue) {
    try {
        console.log(`🔍 Checking waiting list for train ${trainId} on ${journeyDate}`);
        
        // Find the first person in waiting list (lowest waiting position)
        const waitingBooking = await prisma.booking.findFirst({
            where: {
                trainId,
                journeyDate: new Date(journeyDate),
                status: 'Waiting',
                waitingPosition: { not: null }
            },
            orderBy: {
                waitingPosition: 'asc'
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

        if (!waitingBooking) {
            console.log('📋 No one in waiting list');
            return null;
        }

        console.log(`🎯 Found waiting list booking: ${waitingBooking.pnrNumber} at position WL${waitingBooking.waitingPosition}`);
        console.log(`   Passenger: ${waitingBooking.passengerName}`);
        console.log(`   Auto-confirming...`);

        // Emit status update
        if (io) {
            io.emit('booking-status-update', {
                bookingId: waitingBooking.id,
                pnrNumber: waitingBooking.pnrNumber,
                status: 'Processing',
                message: '🎉 Great news! A seat is now available. Confirming your ticket...',
                progress: 50
            });
        }

        // Wait a moment for dramatic effect
        await sleep(2000);

        // Confirm the booking
        await confirmBooking(waitingBooking, io, cache, queue);

        return waitingBooking;

    } catch (error) {
        console.error('Error processing waiting list:', error);
        return null;
    }
}

/**
 * Notify remaining waiting list passengers about updated positions
 */
async function notifyWaitingListUpdates(trainId, journeyDate, io) {
    try {
        // Get all waiting bookings
        const waitingBookings = await prisma.booking.findMany({
            where: {
                trainId,
                journeyDate: new Date(journeyDate),
                status: 'Waiting',
                waitingPosition: { not: null }
            },
            orderBy: {
                waitingPosition: 'asc'
            }
        });

        // Update positions (they should decrease by 1)
        for (let i = 0; i < waitingBookings.length; i++) {
            const booking = waitingBookings[i];
            const newPosition = i + 1;

            if (booking.waitingPosition !== newPosition) {
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { waitingPosition: newPosition }
                });

                // Emit position update
                if (io) {
                    io.emit('waiting-position-update', {
                        bookingId: booking.id,
                        pnrNumber: booking.pnrNumber,
                        oldPosition: booking.waitingPosition,
                        newPosition: newPosition,
                        message: `Your waiting list position updated: WL${booking.waitingPosition} → WL${newPosition}`
                    });
                }

                console.log(`📊 Updated ${booking.pnrNumber}: WL${booking.waitingPosition} → WL${newPosition}`);
            }
        }

    } catch (error) {
        console.error('Error notifying waiting list updates:', error);
    }
}

module.exports = {
    processBooking,
    startBookingConfirmation,
    cancelPendingConfirmation,
    calculateWaitingPosition,
    hasAvailableSeats,
    getPendingConfirmations,
    processWaitingList,
    notifyWaitingListUpdates
};
