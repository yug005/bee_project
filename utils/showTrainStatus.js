const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showTrainStatus() {
    try {
        console.log('\n🚂 TRAIN STATUS FOR TESTING\n');
        console.log('═'.repeat(80));

        const trains = await prisma.train.findMany({
            orderBy: { availableSeats: 'asc' },
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

        console.log('\n🔴 FULL TRAINS (Test Waiting List):');
        console.log('─'.repeat(80));
        
        const fullTrains = trains.filter(t => t.availableSeats === 0);
        fullTrains.forEach((train, index) => {
            console.log(`\n${index + 1}. Train ID: ${train.id}`);
            console.log(`   ${train.trainNumber} - ${train.name}`);
            console.log(`   ${train.fromStation.city.name} (${train.fromStation.code}) → ${train.toStation.city.name} (${train.toStation.code})`);
            console.log(`   Departure: ${train.departureTime} | Arrival: ${train.arrivalTime}`);
            console.log(`   Class: ${train.class} | Price: ₹${train.price}`);
            console.log(`   🔴 FULL - Available: ${train.availableSeats}/${train.totalSeats} seats`);
        });

        console.log('\n\n⚠️ NEARLY FULL TRAINS (Test Quick Booking):');
        console.log('─'.repeat(80));
        
        const nearlyFull = trains.filter(t => t.availableSeats > 0 && t.availableSeats <= 5);
        nearlyFull.forEach((train, index) => {
            console.log(`\n${index + 1}. Train ID: ${train.id}`);
            console.log(`   ${train.trainNumber} - ${train.name}`);
            console.log(`   ${train.fromStation.city.name} (${train.fromStation.code}) → ${train.toStation.city.name} (${train.toStation.code})`);
            console.log(`   Departure: ${train.departureTime} | Arrival: ${train.arrivalTime}`);
            console.log(`   Class: ${train.class} | Price: ₹${train.price}`);
            console.log(`   ⚠️ NEARLY FULL - Available: ${train.availableSeats}/${train.totalSeats} seats`);
        });

        console.log('\n\n✅ TRAINS WITH SEATS (Normal Booking):');
        console.log('─'.repeat(80));
        
        const available = trains.filter(t => t.availableSeats > 5).slice(0, 5);
        available.forEach((train, index) => {
            console.log(`\n${index + 1}. Train ID: ${train.id}`);
            console.log(`   ${train.trainNumber} - ${train.name}`);
            console.log(`   ${train.fromStation.city.name} (${train.fromStation.code}) → ${train.toStation.city.name} (${train.toStation.code})`);
            console.log(`   Departure: ${train.departureTime} | Arrival: ${train.arrivalTime}`);
            console.log(`   Class: ${train.class} | Price: ₹${train.price}`);
            console.log(`   ✅ Available: ${train.availableSeats}/${train.totalSeats} seats`);
        });

        console.log('\n' + '═'.repeat(80));
        console.log('\n📝 TESTING GUIDE:\n');
        console.log('1. 🔴 Book FULL trains → Will go to WAITING LIST (WL1, WL2, etc.)');
        console.log('2. ⚠️ Book NEARLY FULL trains → Will get confirmed normally but fills quickly');
        console.log('3. ✅ Book AVAILABLE trains → Normal confirmation flow (20-30 seconds)');
        console.log('\n🎯 Watch WebSocket events in browser console to see real-time updates!');
        console.log('📧 Check https://ethereal.email/messages for confirmation emails\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

showTrainStatus();
