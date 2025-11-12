const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetTrains() {
    try {
        console.log('🔄 Resetting all trains to full capacity...\n');

        // Reset all trains to their full capacity
        const result = await prisma.train.updateMany({
            data: {
                availableSeats: prisma.raw('total_seats')
            }
        });

        console.log(`✅ Reset ${result.count} trains to full capacity`);
        console.log('\n📊 All trains now have availableSeats = totalSeats');
        console.log('\n💡 Run "node utils/makeTrainsFull.js" again to create full trains for testing');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetTrains();
