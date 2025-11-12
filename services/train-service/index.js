require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const getPrismaClient = require('../shared/prismaClient');
const { cache, createRedisClient } = require('../shared/redisClient');

const app = express();
const PORT = process.env.TRAIN_SERVICE_PORT || 3002;
const prisma = getPrismaClient();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

// Initialize Redis
createRedisClient();

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware - verifies token with Auth Service
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
    res.json({ status: 'healthy', service: 'train-service' });
});

// Get all states
app.get('/states', authenticateRequest, async (req, res) => {
    try {
        // Try cache first
        let states = await cache.get('states:all');

        if (!states) {
            states = await prisma.state.findMany({
                orderBy: { name: 'asc' }
            });
            await cache.set('states:all', states, 3600); // Cache for 1 hour
        }

        res.json(states);
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ error: 'Failed to fetch states' });
    }
});

// Get cities by state ID
app.get('/states/:stateId/cities', authenticateRequest, async (req, res) => {
    try {
        const stateId = parseInt(req.params.stateId);
        const cacheKey = `cities:state:${stateId}`;
        
        let cities = await cache.get(cacheKey);

        if (!cities) {
            cities = await prisma.city.findMany({
                where: { stateId },
                orderBy: { name: 'asc' }
            });
            await cache.set(cacheKey, cities, 3600);
        }

        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

// Get stations by city ID
app.get('/cities/:cityId/stations', authenticateRequest, async (req, res) => {
    try {
        const cityId = parseInt(req.params.cityId);
        const cacheKey = `stations:city:${cityId}`;
        
        let stations = await cache.get(cacheKey);

        if (!stations) {
            stations = await prisma.station.findMany({
                where: { cityId },
                include: {
                    city: {
                        include: {
                            state: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });
            await cache.set(cacheKey, stations, 3600);
        }

        res.json(stations);
    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

// Search trains by origin and destination
app.post('/trains/search', authenticateRequest, async (req, res) => {
    try {
        const { fromStationId, toStationId, date } = req.body;
        
        if (!fromStationId || !toStationId) {
            return res.status(400).json({ error: 'Origin and destination stations are required' });
        }

        const cacheKey = `trains:search:${fromStationId}:${toStationId}`;
        let trains = await cache.get(cacheKey);

        if (!trains) {
            trains = await prisma.train.findMany({
                where: {
                    fromStationId: parseInt(fromStationId),
                    toStationId: parseInt(toStationId)
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
                },
                orderBy: {
                    price: 'asc'
                }
            });
            await cache.set(cacheKey, trains, 300); // Cache for 5 minutes
        }

        res.json(trains);
    } catch (error) {
        console.error('Error searching trains:', error);
        res.status(500).json({ error: 'Failed to search trains' });
    }
});

// Get all trains
app.get('/trains', authenticateRequest, async (req, res) => {
    try {
        let trains = await cache.get('trains:all');

        if (!trains) {
            trains = await prisma.train.findMany({
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
            await cache.set('trains:all', trains, 300);
        }

        res.json(trains);
    } catch (error) {
        console.error('Error fetching trains:', error);
        res.status(500).json({ error: 'Failed to fetch trains' });
    }
});

// Get train by ID
app.get('/trains/:id', authenticateRequest, async (req, res) => {
    try {
        const trainId = parseInt(req.params.id);
        const cacheKey = `train:${trainId}`;
        
        let train = await cache.get(cacheKey);

        if (!train) {
            train = await prisma.train.findUnique({
                where: { id: trainId },
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

            if (!train) {
                return res.status(404).json({ error: 'Train not found' });
            }

            await cache.set(cacheKey, train, 300);
        }

        res.json(train);
    } catch (error) {
        console.error('Error fetching train:', error);
        res.status(500).json({ error: 'Failed to fetch train' });
    }
});

// Add new train (Admin only - enforce in API Gateway)
app.post('/trains', authenticateRequest, async (req, res) => {
    try {
        const { name, trainNumber, fromStationId, toStationId, departureTime, arrivalTime, price, trainClass } = req.body;

        const train = await prisma.train.create({
            data: {
                name,
                trainNumber,
                fromStationId: parseInt(fromStationId),
                toStationId: parseInt(toStationId),
                departureTime,
                arrivalTime,
                price: parseFloat(price),
                trainClass,
                totalSeats: 400, // Default
                availableSeats: 400
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
        await cache.del('trains:all');

        res.status(201).json({
            message: 'Train added successfully',
            train
        });
    } catch (error) {
        console.error('Error adding train:', error);
        res.status(500).json({ error: 'Failed to add train' });
    }
});

// Update train availability (Internal endpoint for Booking Service)
app.patch('/trains/:id/seats', async (req, res) => {
    try {
        const trainId = parseInt(req.params.id);
        const { seatsChange } = req.body; // positive for release, negative for book

        const train = await prisma.train.update({
            where: { id: trainId },
            data: {
                availableSeats: {
                    increment: seatsChange
                }
            }
        });

        // Invalidate cache
        await cache.del(`train:${trainId}`);
        await cache.del('trains:all');

        res.json({
            message: 'Train seats updated',
            train
        });
    } catch (error) {
        console.error('Error updating train seats:', error);
        res.status(500).json({ error: 'Failed to update train seats' });
    }
});

// Delete train (Admin only)
app.delete('/trains/:id', authenticateRequest, async (req, res) => {
    try {
        const trainId = parseInt(req.params.id);

        await prisma.train.delete({
            where: { id: trainId }
        });

        // Invalidate cache
        await cache.del(`train:${trainId}`);
        await cache.del('trains:all');

        res.json({ message: 'Train deleted successfully' });
    } catch (error) {
        console.error('Error deleting train:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Train not found' });
        }
        res.status(500).json({ error: 'Failed to delete train' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚂 Train Service running on http://localhost:${PORT}`);
});

module.exports = app;
