const Redis = require('ioredis');

// Redis client configuration with graceful error handling
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
        if (times > 10) {
            console.error('❌ Redis connection failed after 10 retries');
            return null; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
};

let redisClient = null;
let isRedisAvailable = false;

function createRedisClient() {
    if (redisClient) return redisClient;

    redisClient = new Redis(redisConfig);

    redisClient.on('connect', () => {
        console.log('✅ Redis connected');
        isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
        console.warn('⚠️ Redis error:', err.message);
        isRedisAvailable = false;
    });

    redisClient.on('close', () => {
        console.warn('⚠️ Redis connection closed');
        isRedisAvailable = false;
    });

    return redisClient;
}

// Cache helper functions with fallback
const cache = {
    async get(key) {
        if (!isRedisAvailable) return null;
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache get error:', error.message);
            return null;
        }
    },

    async set(key, value, ttl = 300) {
        if (!isRedisAvailable) return false;
        try {
            const stringValue = JSON.stringify(value);
            if (ttl) {
                await redisClient.setex(key, ttl, stringValue);
            } else {
                await redisClient.set(key, stringValue);
            }
            return true;
        } catch (error) {
            console.error('Cache set error:', error.message);
            return false;
        }
    },

    async del(key) {
        if (!isRedisAvailable) return false;
        try {
            await redisClient.del(key);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error.message);
            return false;
        }
    },

    isAvailable() {
        return isRedisAvailable;
    }
};

module.exports = {
    createRedisClient,
    cache,
    getRedisClient: () => redisClient
};
