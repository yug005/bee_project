const { PrismaClient } = require('@prisma/client');

// Singleton Prisma Client for microservices
let prisma;

function getPrismaClient() {
    if (!prisma) {
        prisma = new PrismaClient({
            log: ['error', 'warn'],
        });
    }
    return prisma;
}

module.exports = getPrismaClient;
