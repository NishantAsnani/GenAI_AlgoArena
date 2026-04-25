const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const isProduction = process.env.NODE_ENV == 'development';

const connection = isProduction
  ? new IORedis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  maxRetriesPerRequest: null
})
  : new IORedis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      maxRetriesPerRequest: null,
    });

const submissionQueue = new Queue('submission-queue', { connection });

module.exports = { submissionQueue,connection };