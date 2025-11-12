const { locationData } = require('./locationData');
const { trainData } = require('./trainData');

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { states, cities, stations } = require('./locationData');
const { trains } = require('./trainData');

async function seedDatabase(prisma) {
    try {
        // Check if already seeded
        const existingStates = await prisma.state.findMany();
        if (existingStates.length > 0) {
            console.log("Database already seeded. Skipping seed.");
            return;
        }

        console.log("Seeding database with comprehensive data...");

        // Seed States
        for (const stateData of locationData.states) {
            const state = await prisma.state.create({
                data: {
                    name: stateData.name,
                    code: stateData.code
                }
            });

            // Seed Cities for this State
            const cities = locationData.cities[stateData.code] || [];
            for (const cityData of cities) {
                const city = await prisma.city.create({
                    data: {
                        name: cityData.name,
                        stateId: state.id
                    }
                });

                // Seed Stations for this City
                for (const stationData of cityData.stations) {
                    await prisma.station.create({
                        data: {
                            name: stationData.name,
                            code: stationData.code,
                            cityId: city.id
                        }
                    });
                }
            }
        }

        console.log("✓ States, Cities, and Stations seeded successfully");

        // Seed Trains
        for (const train of trainData) {
            const fromStation = await prisma.station.findUnique({
                where: { code: train.from }
            });
            const toStation = await prisma.station.findUnique({
                where: { code: train.to }
            });

            if (fromStation && toStation) {
                await prisma.train.create({
                    data: {
                        name: train.name,
                        trainNumber: train.trainNumber,
                        fromStationId: fromStation.id,
                        toStationId: toStation.id,
                        totalSeats: train.seats,
                        availableSeats: train.seats,
                        departureTime: train.departure,
                        arrivalTime: train.arrival,
                        duration: train.duration,
                        price: train.price,
                        class: train.class,
                        trainType: train.type,
                        seatConfiguration: train.class,
                        runsOn: "Daily"
                    }
                });
            }
        }

        console.log(`✓ ${trainData.length} trains seeded successfully`);
        
        // Create admin user
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'arorayug07@gmail.com' }
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('yugyugyug', 10);
            await prisma.user.create({
                data: {
                    username: 'admin_yug',
                    email: 'arorayug07@gmail.com',
                    password: hashedPassword,
                    role: 'admin'
                }
            });
            console.log("✓ Admin user created (arorayug07@gmail.com)");
        }
        
        console.log("✓ Database seeding completed!");

    } catch (e) {
        console.error("Error seeding database:", e);
    }
};

// Legacy function for backward compatibility
const seedTrains = async (prisma) => {
    try {
        const existingTrains = await prisma.train.findMany();
        if (existingTrains.length === 0) {
            const trains = [
                { 
                    name: "Rajdhani Express", 
                    trainNumber: "12951",
                    source: "Mumbai Central", 
                    destination: "New Delhi", 
                    totalSeats: 72, 
                    availableSeats: 72, 
                    departureTime: "16:35", 
                    arrivalTime: "08:35",
                    duration: "16h 00m",
                    price: 2500.00,
                    class: "AC 2-Tier"
                },
                { 
                    name: "Shatabdi Express", 
                    trainNumber: "12001",
                    source: "New Delhi", 
                    destination: "Bhopal", 
                    totalSeats: 50, 
                    availableSeats: 50, 
                    departureTime: "06:00", 
                    arrivalTime: "13:45",
                    duration: "7h 45m",
                    price: 1850.00,
                    class: "AC Chair Car"
                },
                { 
                    name: "Duronto Express", 
                    trainNumber: "12213",
                    source: "Kolkata", 
                    destination: "New Delhi", 
                    totalSeats: 64, 
                    availableSeats: 64, 
                    departureTime: "15:50", 
                    arrivalTime: "09:55",
                    duration: "17h 05m",
                    price: 2100.00,
                    class: "AC 3-Tier"
                },
                { 
                    name: "Garib Rath Express", 
                    trainNumber: "12909",
                    source: "Mumbai", 
                    destination: "Ahmedabad", 
                    totalSeats: 80, 
                    availableSeats: 80, 
                    departureTime: "21:10", 
                    arrivalTime: "06:50",
                    duration: "9h 40m",
                    price: 750.00,
                    class: "AC 3-Tier"
                },
                { 
                    name: "Vande Bharat Express", 
                    trainNumber: "22439",
                    source: "New Delhi", 
                    destination: "Varanasi", 
                    totalSeats: 44, 
                    availableSeats: 44, 
                    departureTime: "06:00", 
                    arrivalTime: "14:00",
                    duration: "8h 00m",
                    price: 1800.00,
                    class: "Executive Chair"
                },
                { 
                    name: "Chennai Express", 
                    trainNumber: "12163",
                    source: "Bangalore", 
                    destination: "Chennai", 
                    totalSeats: 56, 
                    availableSeats: 56, 
                    departureTime: "06:30", 
                    arrivalTime: "11:00",
                    duration: "4h 30m",
                    price: 650.00,
                    class: "AC 2-Tier"
                },
                { 
                    name: "Deccan Queen", 
                    trainNumber: "12123",
                    source: "Mumbai CST", 
                    destination: "Pune", 
                    totalSeats: 40, 
                    availableSeats: 40, 
                    departureTime: "07:15", 
                    arrivalTime: "10:40",
                    duration: "3h 25m",
                    price: 450.00,
                    class: "AC Chair Car"
                },
                { 
                    name: "Kerala Express", 
                    trainNumber: "12625",
                    source: "New Delhi", 
                    destination: "Trivandrum", 
                    totalSeats: 88, 
                    availableSeats: 88, 
                    departureTime: "11:00", 
                    arrivalTime: "08:00",
                    duration: "45h 00m",
                    price: 2800.00,
                    class: "Sleeper"
                },
                { 
                    name: "Howrah Mail", 
                    trainNumber: "12809",
                    source: "Mumbai", 
                    destination: "Howrah", 
                    totalSeats: 72, 
                    availableSeats: 72, 
                    departureTime: "18:55", 
                    arrivalTime: "06:40",
                    duration: "35h 45m",
                    price: 1950.00,
                    class: "AC 3-Tier"
                },
                { 
                    name: "Tejas Express", 
                    trainNumber: "22119",
                    source: "Mumbai", 
                    destination: "Goa", 
                    totalSeats: 36, 
                    availableSeats: 36, 
                    departureTime: "05:00", 
                    arrivalTime: "13:25",
                    duration: "8h 25m",
                    price: 1200.00,
                    class: "AC Chair Car"
                }
            ];
            await prisma.train.createMany({ data: trains });
            console.log("Database seeded with initial train data.");
        } else {
            console.log("Database already contains trains. Skipping seed.");
        }
    } catch (e) {
        console.error("Error seeding database:", e);
    }
};

module.exports = { seedDatabase, seedTrains };