const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeTrainsFull() {
    try {
        console.log('🎯 Making some trains full for testing waiting list feature...\n');

        // Get all trains
        const trains = await prisma.train.findMany({
            take: 10,
            include: {
                fromStation: {
                    include: {
                        city: true
                    }
                },
                toStation: {
                    include: {
                        city: true
                    }
                }
            }
        });

        if (trains.length === 0) {
            console.log('❌ No trains found in database!');
            return;
        }

        // Make first 5 trains full (0 seats)
        const trainsToFill = trains.slice(0, 5);
        
        for (const train of trainsToFill) {
            await prisma.train.update({
                where: { id: train.id },
                data: { availableSeats: 0 }
            });
            
            console.log(`🚂 ${train.trainNumber} - ${train.name}`);
            console.log(`   From: ${train.fromStation.city.name} → To: ${train.toStation.city.name}`);
            console.log(`   ✅ Available Seats: ${train.totalSeats} → 0 (FULL)`);
            console.log('');
        }

        // Make next 3 trains nearly full (2-5 seats)
        const trainsNearlyFull = trains.slice(5, 8);
        
        for (const train of trainsNearlyFull) {
            const remainingSeats = Math.floor(Math.random() * 4) + 2; // 2-5 seats
            
            await prisma.train.update({
                where: { id: train.id },
                data: { availableSeats: remainingSeats }
            });
            
            console.log(`🚂 ${train.trainNumber} - ${train.name}`);
            console.log(`   From: ${train.fromStation.city.name} → To: ${train.toStation.city.name}`);
            console.log(`   ⚠️ Available Seats: ${train.totalSeats} → ${remainingSeats} (Nearly Full)`);
            console.log('');
        }

        console.log('✅ Trains updated successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - ${trainsToFill.length} trains are now FULL (0 seats)`);
        console.log(`   - ${trainsNearlyFull.length} trains are nearly full (2-5 seats)`);
        console.log('\n🎫 Try booking these trains to test the waiting list feature!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

makeTrainsFull();
