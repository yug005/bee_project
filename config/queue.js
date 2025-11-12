const Queue = require('bull');
const { sendEmail } = require('../config/email');

// Queue configuration
const queueConfig = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined
    }
};

// Create queues
const emailQueue = new Queue('email-queue', queueConfig);
const bookingQueue = new Queue('booking-queue', queueConfig);
const notificationQueue = new Queue('notification-queue', queueConfig);

// Email Queue Processor
emailQueue.process(async (job) => {
    const { to, template, data } = job.data;
    
    console.log(`📧 Processing email job ${job.id} for ${to}`);
    
    try {
        const result = await sendEmail(to, template, data);
        
        if (result.success) {
            console.log(`✅ Ticket confirmation email sent to ${to}`);
            return { success: true, messageId: result.messageId };
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error(`❌ Email job ${job.id} failed:`, error.message);
        throw error;
    }
});

// Booking Queue Processor
bookingQueue.process(async (job) => {
    const { bookingId, userId, trainId } = job.data;
    
    console.log(`🎫 Processing booking job ${job.id}`);
    
    try {
        // Add any post-booking processing here
        // For example: analytics, notifications, third-party integrations
        
        console.log(`✅ Booking ${bookingId} processed successfully`);
        return { success: true, bookingId };
    } catch (error) {
        console.error(`❌ Booking job ${job.id} failed:`, error.message);
        throw error;
    }
});

// Notification Queue Processor
notificationQueue.process(async (job) => {
    const { type, userId, message } = job.data;
    
    console.log(`🔔 Processing notification job ${job.id}`);
    
    try {
        // Add notification logic here (push notifications, SMS, etc.)
        
        console.log(`✅ Notification sent to user ${userId}`);
        return { success: true, type };
    } catch (error) {
        console.error(`❌ Notification job ${job.id} failed:`, error.message);
        throw error;
    }
});

// Queue event handlers
emailQueue.on('completed', (job, result) => {
    console.log(`✅ Email sent successfully (Job ${job.id})`);
});

emailQueue.on('failed', (job, err) => {
    console.error(`❌ Email job ${job.id} failed:`, err.message);
});

bookingQueue.on('completed', (job, result) => {
    console.log(`✅ Booking job ${job.id} completed`);
});

bookingQueue.on('failed', (job, err) => {
    console.error(`❌ Booking job ${job.id} failed:`, err.message);
});

notificationQueue.on('completed', (job, result) => {
    console.log(`✅ Notification job ${job.id} completed`);
});

notificationQueue.on('failed', (job, err) => {
    console.error(`❌ Notification job ${job.id} failed:`, err.message);
});

// Helper functions to add jobs to queues
const queueHelpers = {
    // Add email to queue
    async addEmailJob(to, template, data, options = {}) {
        try {
            const job = await emailQueue.add(
                { to, template, data },
                {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000
                    },
                    removeOnComplete: true,
                    removeOnFail: false,
                    ...options
                }
            );
            console.log(`📧 Email job ${job.id} queued for ${to}`);
            return job;
        } catch (error) {
            console.error('Error adding email job:', error.message);
            throw error;
        }
    },

    // Add booking processing to queue
    async addBookingJob(bookingId, userId, trainId, options = {}) {
        try {
            const job = await bookingQueue.add(
                { bookingId, userId, trainId },
                {
                    attempts: 2,
                    backoff: {
                        type: 'fixed',
                        delay: 3000
                    },
                    removeOnComplete: true,
                    removeOnFail: false,
                    ...options
                }
            );
            console.log(`🎫 Booking job ${job.id} added to queue`);
            return job;
        } catch (error) {
            console.error('Error adding booking job:', error.message);
            throw error;
        }
    },

    // Add notification to queue
    async addNotificationJob(type, userId, message, options = {}) {
        try {
            const job = await notificationQueue.add(
                { type, userId, message },
                {
                    attempts: 2,
                    delay: 1000,
                    removeOnComplete: true,
                    removeOnFail: false,
                    ...options
                }
            );
            console.log(`🔔 Notification job ${job.id} added to queue`);
            return job;
        } catch (error) {
            console.error('Error adding notification job:', error.message);
            throw error;
        }
    },

    // Get queue stats
    async getQueueStats(queueName) {
        const queue = queueName === 'email' ? emailQueue : 
                     queueName === 'booking' ? bookingQueue : 
                     notificationQueue;
        
        const [waiting, active, completed, failed] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount()
        ]);

        return {
            queue: queueName,
            waiting,
            active,
            completed,
            failed,
            total: waiting + active + completed + failed
        };
    },

    // Clear queue
    async clearQueue(queueName) {
        const queue = queueName === 'email' ? emailQueue : 
                     queueName === 'booking' ? bookingQueue : 
                     notificationQueue;
        
        await queue.clean(0, 'completed');
        await queue.clean(0, 'failed');
        console.log(`🗑️ ${queueName} queue cleared`);
    }
};

module.exports = {
    emailQueue,
    bookingQueue,
    notificationQueue,
    queueHelpers
};
