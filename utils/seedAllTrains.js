const { PrismaClient } = require('@prisma/client');
const { trainData } = require('./trainData');
const { locationData } = require('./locationData');

const prisma = new PrismaClient();

async function seedAllTrains() {
    try {
        console.log('🚂 Comprehensive database seeding started...\n');
        
        // Step 1: Seed locations (states, cities, stations)
        console.log('📍 Step 1: Seeding locations...');
        await prisma.booking.deleteMany();
        await prisma.train.deleteMany();
        await prisma.station.deleteMany();
        await prisma.city.deleteMany();
        await prisma.state.deleteMany();
        
        for (const state of locationData.states) {
            const createdState = await prisma.state.create({
                data: {
                    name: state.name,
                    code: state.code
                }
            });
            
            const citiesForState = locationData.cities[state.code] || [];
            for (const city of citiesForState) {
                const createdCity = await prisma.city.create({
                    data: {
                        name: city.name,
                        stateId: createdState.id
                    }
                });
                
                for (const station of city.stations) {
                    await prisma.station.create({
                        data: {
                            name: station.name,
                            code: station.code,
                            cityId: createdCity.id
                        }
                    });
                }
            }
        }
        
        const stationCount = await prisma.station.count();
        console.log(`✅ Created ${stationCount} stations\n`);
        
        // Step 2: Seed all trains
        console.log('🚂 Step 2: Seeding trains...');
        let created = 0;
        let skipped = 0;
        
        for (const train of trainData) {
            try {
                const fromStation = await prisma.station.findUnique({
                    where: { code: train.from }
                });
                const toStation = await prisma.station.findUnique({
                    where: { code: train.to }
                });
                
                if (!fromStation || !toStation) {
                    console.log(`⚠️  Skipped ${train.name} (${train.trainNumber}): Missing stations ${train.from} or ${train.to}`);
                    skipped++;
                    continue;
                }
                
                await prisma.train.create({
                    data: {
                        name: train.name,
                        trainNumber: train.trainNumber,
                        fromStationId: fromStation.id,
                        toStationId: toStation.id,
                        totalSeats: train.seats,
                        availableSeats: train.trainNumber === '12009' ? 1 : train.seats, // Mumbai Shatabdi has only 1 seat left
                        departureTime: train.departure,
                        arrivalTime: train.arrival,
                        duration: train.duration,
                        price: train.price,
                        class: train.class,
                        trainType: train.type || 'Express',
                        seatConfiguration: train.class,
                        runsOn: 'Daily'
                    }
                });
                created++;
                
                if (train.trainNumber === '12009') {
                    console.log(`✅ Mumbai Shatabdi created with ${train.seats} total seats, only 1 available (49 booked)`);
                }
            } catch (error) {
                console.log(`✗ Error creating ${train.name}: ${error.message}`);
                skipped++;
            }
        }
        
        console.log(`\n✅ Successfully created ${created} trains`);
        if (skipped > 0) {
            console.log(`⚠️  Skipped ${skipped} trains (missing station codes)\n`);
        }
        
        // Step 3: Verify Mumbai Shatabdi
        const mumbaiTrain = await prisma.train.findFirst({
            where: { trainNumber: '12009' },
            include: {
                fromStation: true,
                toStation: true
            }
        });
        
        if (mumbaiTrain) {
            console.log(`📋 Mumbai Shatabdi Details:`);
            console.log(`   Name: ${mumbaiTrain.name}`);
            console.log(`   Train Number: ${mumbaiTrain.trainNumber}`);
            console.log(`   Route: ${mumbaiTrain.fromStation.name} → ${mumbaiTrain.toStation.name}`);
            console.log(`   Total Seats: ${mumbaiTrain.totalSeats}`);
            console.log(`   Available Seats: ${mumbaiTrain.availableSeats}`);
        }
        
        // Final summary
        const finalCounts = await prisma.$transaction([
            prisma.state.count(),
            prisma.city.count(),
            prisma.station.count(),
            prisma.train.count(),
            prisma.user.count()
        ]);
        
        console.log(`\n📊 Final Database Summary:`);
        console.log(`   States: ${finalCounts[0]}`);
        console.log(`   Cities: ${finalCounts[1]}`);
        console.log(`   Stations: ${finalCounts[2]}`);
        console.log(`   Trains: ${finalCounts[3]}`);
        console.log(`   Users: ${finalCounts[4]}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

seedAllTrains();
