import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || '';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.warn('Redis connection error. App will fallback to Database.', err.message);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis Caching layer');
});
