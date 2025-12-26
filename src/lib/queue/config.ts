import { ConnectionOptions } from 'bullmq'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
const parsedUrl = new URL(redisUrl)

export const redisConnection: ConnectionOptions = {
  host: parsedUrl.hostname,
  port: parseInt(parsedUrl.port) || 6379,
  password: parsedUrl.password || undefined,
  username: parsedUrl.username || undefined,
}

export const QUEUE_NAME = 'generation-queue'

export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 1000,
  },
  removeOnComplete: {
    count: 100,
    age: 24 * 3600, // 24 hours
  },
  removeOnFail: {
    count: 50,
    age: 7 * 24 * 3600, // 7 days
  },
}
