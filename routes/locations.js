const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const authenticateToken = require('../middleware/authMiddleware');

// Get all states
router.get('/states', authenticateToken, async (req, res) => {
    try {
        const states = await prisma.state.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(states);
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ error: 'Failed to fetch states' });
    }
});

// Get cities by state ID
router.get('/states/:stateId/cities', authenticateToken, async (req, res) => {
    try {
        const stateId = parseInt(req.params.stateId);
        const cities = await prisma.city.findMany({
            where: { stateId },
            orderBy: { name: 'asc' }
        });
        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

// Get stations by city ID
router.get('/cities/:cityId/stations', authenticateToken, async (req, res) => {
    try {
        const cityId = parseInt(req.params.cityId);
        const stations = await prisma.station.findMany({
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
        res.json(stations);
    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

// Search trains by origin and destination
router.post('/trains/search', authenticateToken, async (req, res) => {
    try {
        const { fromStationId, toStationId, date } = req.body;
        
        if (!fromStationId || !toStationId) {
            return res.status(400).json({ error: 'Origin and destination stations are required' });
        }

        const trains = await prisma.train.findMany({
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

        res.json(trains);
    } catch (error) {
        console.error('Error searching trains:', error);
        res.status(500).json({ error: 'Failed to search trains' });
    }
});

// Get all trains (with location details)
router.get('/trains-all', authenticateToken, async (req, res) => {
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

module.exports = router;
