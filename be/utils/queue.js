const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const isDevelopment = process.env.NODE_ENV == 'development';



const connection = isDevelopment
  ? new IORedis(process.env.UPSTASH_REDIS_URL, {  
      maxRetriesPerRequest: null,
      tls: {}
    })
  : new IORedis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      maxRetriesPerRequest: null,
    });


const submissionQueue = new Queue('submission-queue', { connection });

module.exports = { submissionQueue,connection };