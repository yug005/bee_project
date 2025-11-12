const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupWaitingListTest() {
    try {
        console.log('🎯 Setting up trains for WAITING LIST testing...\n');

        // Get some popular trains
        const trains = await prisma.train.findMany({
            take: 5,
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
            console.log('❌ No trains found!');
            return;
        }

        console.log('🎫 PERFECT SCENARIO FOR TESTING:\n');
        console.log('═'.repeat(80));

        // Make first 3 trains have only 1 seat left
        for (let i = 0; i < 3 && i < trains.length; i++) {
            const train = trains[i];
            
            await prisma.train.update({
                where: { id: train.id },
                data: { availableSeats: 1 }
            });

            console.log(`\n🚂 Train ID: ${train.id}`);
            console.log(`   ${train.trainNumber} - ${train.name}`);
            console.log(`   ${train.fromStation.city.name} → ${train.toStation.city.name}`);
            console.log(`   ⚠️ ONLY 1 SEAT LEFT! Perfect for testing`);
            console.log(`   
📝 TEST SCENARIO:
   1. Open browser #1 → Login as User A → Book this train (gets the last seat)
   2. Open browser #2 → Login as User B → Book this train (goes to WL1)
   3. In browser #1 → Cancel booking
   4. Watch browser #2 → Should auto-confirm instantly! 🎉
            `);
        }

        // Make next 2 trains have 2 seats (for multi-person waiting list)
        for (let i = 3; i < 5 && i < trains.length; i++) {
            const train = trains[i];
            
            await prisma.train.update({
                where: { id: train.id },
                data: { availableSeats: 2 }
            });

            console.log(`\n🚂 Train ID: ${train.id}`);
            console.log(`   ${train.trainNumber} - ${train.name}`);
            console.log(`   ${train.fromStation.city.name} → ${train.toStation.city.name}`);
            console.log(`   ⚠️ 2 SEATS LEFT! Test multiple waiting list`);
            console.log(`   
📝 TEST SCENARIO:
   1. Book from 2 browsers → Both get seats
   2. Book from 3rd browser → Goes to WL1
   3. Book from 4th browser → Goes to WL2
   4. Cancel from browser #1 → WL1 auto-confirms, WL2 becomes WL1
   5. Cancel from browser #2 → New WL1 auto-confirms! 🎉
            `);
        }

        console.log('\n' + '═'.repeat(80));
        console.log('\n✅ Setup complete!');
        console.log('\n🎯 TESTING TIPS:');
        console.log('   • Use incognito/private windows for different users');
        console.log('   • Open browser console to see WebSocket events live');
        console.log('   • Watch real-time status updates: Waiting → Confirmed');
        console.log('   • Check server terminal for detailed logs');
        console.log('\n📡 WEBSOCKET EVENTS TO WATCH:');
        console.log('   • booking-created - When booking is made');
        console.log('   • booking-cancelled - When someone cancels');
        console.log('   • booking-status-update - When WL confirms automatically');
        console.log('   • waiting-list-processed - Confirmation notification');
        console.log('   • waiting-position-update - Position changes (WL2→WL1)');
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupWaitingListTest();
