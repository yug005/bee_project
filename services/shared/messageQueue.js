const amqp = require('amqplib');

let connection = null;
let channel = null;
let isQueueAvailable = false;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function connectQueue() {
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        
        console.log('✅ RabbitMQ connected');
        isQueueAvailable = true;

        connection.on('error', (err) => {
            console.error('❌ RabbitMQ connection error:', err.message);
            isQueueAvailable = false;
        });

        connection.on('close', () => {
            console.warn('⚠️ RabbitMQ connection closed');
            isQueueAvailable = false;
            // Attempt to reconnect after 5 seconds
            setTimeout(connectQueue, 5000);
        });

        return channel;
    } catch (error) {
        console.error('❌ RabbitMQ connection failed:', error.message);
        console.warn('⚠️ Running without message queue - notifications will be processed synchronously');
        isQueueAvailable = false;
        return null;
    }
}

async function publishMessage(queue, message) {
    if (!isQueueAvailable || !channel) {
        console.warn('⚠️ Queue not available, skipping message:', queue);
        return false;
    }

    try {
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true
        });
        return true;
    } catch (error) {
        console.error('Failed to publish message:', error.message);
        return false;
    }
}

async function consumeMessages(queue, callback) {
    if (!isQueueAvailable || !channel) {
        console.warn('⚠️ Queue not available, cannot consume:', queue);
        return;
    }

    try {
        await channel.assertQueue(queue, { durable: true });
        channel.prefetch(1);
        
        console.log(`📡 Waiting for messages in queue: ${queue}`);
        
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    await callback(content);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing message:', error);
                    channel.nack(msg, false, false); // Don't requeue
                }
            }
        });
    } catch (error) {
        console.error('Failed to consume messages:', error.message);
    }
}

function isAvailable() {
    return isQueueAvailable;
}

module.exports = {
    connectQueue,
    publishMessage,
    consumeMessages,
    isAvailable
};
