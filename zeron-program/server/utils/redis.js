const Redis = require('ioredis');
require('dotenv').config();

const redisClient = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

if (redisClient) {
  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });
  redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
  });
}

module.exports = redisClient;
