const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');

const prisma = new PrismaClient();

/**
 * Process waiting list when a seat becomes available
 * This automatically confirms the next person in waiting list
 */
async function processWaitingList(trainId, journeyDate, io, cache, queue) {
    try {
        console.log(`\n🔄 Processing waiting list for train ${trainId} on ${journeyDate}`);

        // Get the next person in waiting list (lowest waiting position)
        const nextInLine = await prisma.booking.findFirst({
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

        if (!nextInLine) {
            console.log('✅ No one in waiting list');
            return null;
        }

        console.log(`👤 Next in line: ${nextInLine.passengerName} - Position WL${nextInLine.waitingPosition}`);

        // Update train to decrease available seats
        await prisma.train.update({
            where: { id: trainId },
            data: { availableSeats: { decrement: 1 } }
        });

        // Generate QR code
        const qrData = JSON.stringify({
            pnr: nextInLine.pnrNumber,
            trainNumber: nextInLine.train.trainNumber,
            trainName: nextInLine.train.name,
            passenger: nextInLine.passengerName,
            from: nextInLine.train.fromStation?.name || 'N/A',
            to: nextInLine.train.toStation?.name || 'N/A',
            date: nextInLine.journeyDate.toISOString(),
            seat: `${nextInLine.coachNumber}-${nextInLine.seatNumber}`,
            bookingId: nextInLine.id
        });

        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2
        });

        // Update booking to confirmed
        const confirmedBooking = await prisma.booking.update({
            where: { id: nextInLine.id },
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

        console.log(`✅ Booking ${confirmedBooking.pnrNumber} auto-confirmed from waiting list!`);

        // Emit WebSocket event for real-time update
        if (io) {
            io.emit('booking-status-update', {
                bookingId: confirmedBooking.id,
                pnrNumber: confirmedBooking.pnrNumber,
                status: 'Confirmed',
                message: '🎉 Great news! A seat became available and your ticket is now CONFIRMED!',
                autoConfirmed: true,
                qrCode: qrCodeDataURL
            });

            // Broadcast to all clients that waiting list was processed
            io.emit('waiting-list-processed', {
                trainId,
                journeyDate,
                confirmedBookingId: confirmedBooking.id,
                pnrNumber: confirmedBooking.pnrNumber,
                message: `WL${nextInLine.waitingPosition} confirmed automatically`
            });
        }

        // Send confirmation email
        if (queue && confirmedBooking.user && confirmedBooking.user.email) {
            await queue.addEmailJob(
                confirmedBooking.user.email,
                'bookingConfirmation',
                {
                    booking: confirmedBooking,
                    train: confirmedBooking.train,
                    qrCode: qrCodeDataURL
                }
            );
            console.log(`📧 Confirmation email queued for ${confirmedBooking.user.email}`);
        }

        // Update waiting positions for remaining people
        await updateWaitingPositions(trainId, journeyDate);

        // Invalidate cache
        if (cache) {
            await cache.del('trains:all');
            await cache.del(`train:${trainId}`);
        }

        return confirmedBooking;

    } catch (error) {
        console.error('❌ Error processing waiting list:', error);
        return null;
    }
}

/**
 * Update waiting positions after someone gets confirmed
 */
async function updateWaitingPositions(trainId, journeyDate) {
    try {
        // Get all remaining people in waiting list, ordered by position
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

        // Update positions (1, 2, 3, ...)
        for (let i = 0; i < waitingBookings.length; i++) {
            await prisma.booking.update({
                where: { id: waitingBookings[i].id },
                data: { waitingPosition: i + 1 }
            });
        }

        console.log(`📝 Updated ${waitingBookings.length} waiting positions`);

    } catch (error) {
        console.error('Error updating waiting positions:', error);
    }
}

/**
 * Check and notify users about their updated waiting position
 */
async function notifyWaitingListUpdates(trainId, journeyDate, io) {
    try {
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

        // Notify each person about their current position
        waitingBookings.forEach(booking => {
            if (io) {
                io.emit('waiting-position-update', {
                    bookingId: booking.id,
                    pnrNumber: booking.pnrNumber,
                    waitingPosition: booking.waitingPosition,
                    message: `Your current position: WL${booking.waitingPosition}`
                });
            }
        });

    } catch (error) {
        console.error('Error notifying waiting list updates:', error);
    }
}

module.exports = {
    processWaitingList,
    updateWaitingPositions,
    notifyWaitingListUpdates
};
