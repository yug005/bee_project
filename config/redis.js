const Redis = require('ioredis');

// Redis client configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3
};

// Create Redis clients
const redisClient = new Redis(redisConfig);
const redisSubscriber = new Redis(redisConfig);
const redisPublisher = new Redis(redisConfig);

// Redis client event handlers
redisClient.on('connect', () => {
    console.log('✅ Redis client connected');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis client error:', err.message);
});

redisSubscriber.on('connect', () => {
    console.log('✅ Redis subscriber connected');
});

redisPublisher.on('connect', () => {
    console.log('✅ Redis publisher connected');
});

// Cache helper functions
const cache = {
    // Get cached data
    async get(key) {
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache get error:', error.message);
            return null;
        }
    },

    // Set cached data with optional TTL (in seconds)
    async set(key, value, ttl = 3600) {
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

    // Delete cached data
    async del(key) {
        try {
            await redisClient.del(key);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error.message);
            return false;
        }
    },

    // Delete multiple keys matching pattern
    async delPattern(pattern) {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
            return true;
        } catch (error) {
            console.error('Cache delete pattern error:', error.message);
            return false;
        }
    },

    // Check if key exists
    async exists(key) {
        try {
            return await redisClient.exists(key) === 1;
        } catch (error) {
            console.error('Cache exists error:', error.message);
            return false;
        }
    },

    // Get TTL of a key
    async ttl(key) {
        try {
            return await redisClient.ttl(key);
        } catch (error) {
            console.error('Cache TTL error:', error.message);
            return -1;
        }
    },

    // Increment a counter
    async incr(key) {
        try {
            return await redisClient.incr(key);
        } catch (error) {
            console.error('Cache increment error:', error.message);
            return null;
        }
    },

    // Clear all cache
    async clear() {
        try {
            await redisClient.flushdb();
            console.log('🗑️ Cache cleared');
            return true;
        } catch (error) {
            console.error('Cache clear error:', error.message);
            return false;
        }
    }
};

// Pub/Sub helper
const pubsub = {
    // Publish message to channel
    async publish(channel, message) {
        try {
            const stringMessage = typeof message === 'string' ? message : JSON.stringify(message);
            await redisPublisher.publish(channel, stringMessage);
            return true;
        } catch (error) {
            console.error('Pub/Sub publish error:', error.message);
            return false;
        }
    },

    // Subscribe to channel
    subscribe(channel, callback) {
        try {
            redisSubscriber.subscribe(channel, (err, count) => {
                if (err) {
                    console.error('Subscribe error:', err.message);
                    return;
                }
                console.log(`📡 Subscribed to ${count} channel(s): ${channel}`);
            });

            redisSubscriber.on('message', (ch, message) => {
                if (ch === channel) {
                    try {
                        const data = JSON.parse(message);
                        callback(data);
                    } catch (e) {
                        callback(message);
                    }
                }
            });
            return true;
        } catch (error) {
            console.error('Pub/Sub subscribe error:', error.message);
            return false;
        }
    },

    // Unsubscribe from channel
    async unsubscribe(channel) {
        try {
            await redisSubscriber.unsubscribe(channel);
            console.log(`📡 Unsubscribed from: ${channel}`);
            return true;
        } catch (error) {
            console.error('Pub/Sub unsubscribe error:', error.message);
            return false;
        }
    }
};

module.exports = {
    redisClient,
    redisSubscriber,
    redisPublisher,
    cache,
    pubsub
};
