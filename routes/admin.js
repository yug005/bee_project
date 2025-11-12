const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { queueHelpers } = require('../config/queue');

const prisma = new PrismaClient();

// Get system stats (admin only)
router.get('/admin/stats', authenticateToken, adminMiddleware, async (req, res) => {
    try {
        const cache = req.app.get('cache');
        
        // Get queue statistics
        const emailQueueStats = await queueHelpers.getQueueStats('email');
        const bookingQueueStats = await queueHelpers.getQueueStats('booking');
        const notificationQueueStats = await queueHelpers.getQueueStats('notification');
        
        // Get database counts
        const [userCount, trainCount, bookingCount] = await Promise.all([
            prisma.user.count(),
            prisma.train.count(),
            prisma.booking.count()
        ]);
        
        res.json({
            database: {
                users: userCount,
                trains: trainCount,
                bookings: bookingCount
            },
            queues: {
                email: emailQueueStats,
                booking: bookingQueueStats,
                notification: notificationQueueStats
            },
            cache: {
                status: cache ? 'connected' : 'disconnected'
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Clear cache (admin only)
router.post('/admin/cache/clear', authenticateToken, adminMiddleware, async (req, res) => {
    try {
        const cache = req.app.get('cache');
        
        if (!cache) {
            return res.status(503).json({ error: 'Cache is not available' });
        }
        
        await cache.clear();
        res.json({ message: 'Cache cleared successfully!' });
    } catch (error) {
        console.error('Error clearing cache:', error);
        res.status(500).json({ error: 'Failed to clear cache' });
    }
});

// Clear specific queue (admin only)
router.post('/admin/queue/:queueName/clear', authenticateToken, adminMiddleware, async (req, res) => {
    try {
        const { queueName } = req.params;
        
        if (!['email', 'booking', 'notification'].includes(queueName)) {
            return res.status(400).json({ error: 'Invalid queue name' });
        }
        
        await queueHelpers.clearQueue(queueName);
        res.json({ message: `${queueName} queue cleared successfully!` });
    } catch (error) {
        console.error('Error clearing queue:', error);
        res.status(500).json({ error: 'Failed to clear queue' });
    }
});

// Get all trains (for admin panel)
router.get('/admin/trains', authenticateToken, adminMiddleware, async (req, res) => {
    try {
        const trains = await prisma.train.findMany({
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
            },
            orderBy: {
                trainNumber: 'asc'
            }
        });
        res.json(trains);
    } catch (error) {
        console.error('Error fetching trains:', error);
        res.status(500).json({ error: 'Failed to fetch trains' });
    }
});

// Add new train (admin only)
router.post('/admin/trains', authenticateToken, adminMiddleware, async (req, res) => {
    const { 
        name, 
        trainNumber, 
        fromStationId, 
        toStationId, 
        departureTime, 
        arrivalTime, 
        duration,
        price,
        trainClass
    } = req.body;

    try {
        // Default: 3 coaches, 72 seats total (24 seats per coach)
        const defaultSeats = 72;
        
        const train = await prisma.train.create({
            data: {
                name,
                trainNumber,
                fromStationId: parseInt(fromStationId),
                toStationId: parseInt(toStationId),
                departureTime,
                arrivalTime,
                duration,
                price: parseFloat(price),
                class: trainClass,
                totalSeats: defaultSeats,
                availableSeats: defaultSeats,
                trainType: 'Express',
                seatConfiguration: trainClass,
                runsOn: 'Daily'
            },
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
        });

        // Invalidate cache
        const cache = req.app.get('cache');
        if (cache) {
            await cache.del('trains:all');
        }

        // Emit WebSocket event
        const io = req.app.get('io');
        if (io) {
            io.emit('train-added', { train });
        }

        res.status(201).json({ 
            message: 'Train added successfully!', 
            train 
        });
    } catch (error) {
        console.error('Error adding train:', error);
        res.status(500).json({ error: 'Failed to add train' });
    }
});

// Delete train (admin only)
router.delete('/admin/trains/:id', authenticateToken, adminMiddleware, async (req, res) => {
    const trainId = parseInt(req.params.id);

    try {
        // Check if there are any bookings for this train
        const bookings = await prisma.booking.findMany({
            where: { trainId }
        });

        if (bookings.length > 0) {
            return res.status(409).json({ 
                error: 'Cannot delete train with existing bookings. Cancel all bookings first.' 
            });
        }

        await prisma.train.delete({
            where: { id: trainId }
        });

        // Invalidate cache
        const cache = req.app.get('cache');
        if (cache) {
            await cache.del('trains:all');
            await cache.del(`train:${trainId}`);
        }

        // Emit WebSocket event
        const io = req.app.get('io');
        if (io) {
            io.emit('train-removed', { trainId });
        }

        res.json({ message: 'Train deleted successfully!' });
    } catch (error) {
        console.error('Error deleting train:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Train not found' });
        }
        res.status(500).json({ error: 'Failed to delete train' });
    }
});

// Update train (admin only)
router.put('/admin/trains/:id', authenticateToken, adminMiddleware, async (req, res) => {
    const trainId = parseInt(req.params.id);
    const { 
        name, 
        trainNumber, 
        fromStationId, 
        toStationId, 
        departureTime, 
        arrivalTime, 
        duration,
        price,
        trainClass
    } = req.body;

    try {
        const train = await prisma.train.update({
            where: { id: trainId },
            data: {
                name,
                trainNumber,
                fromStationId: parseInt(fromStationId),
                toStationId: parseInt(toStationId),
                departureTime,
                arrivalTime,
                duration,
                price: parseFloat(price),
                class: trainClass,
                seatConfiguration: trainClass
            },
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
        });

        // Invalidate cache
        const cache = req.app.get('cache');
        if (cache) {
            await cache.del('trains:all');
            await cache.del(`train:${trainId}`);
        }

        // Emit WebSocket event
        const io = req.app.get('io');
        if (io) {
            io.emit('train-updated', { train });
        }

        res.json({ 
            message: 'Train updated successfully!', 
            train 
        });
    } catch (error) {
        console.error('Error updating train:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Train not found' });
        }
        res.status(500).json({ error: 'Failed to update train' });
    }
});

module.exports = router;
