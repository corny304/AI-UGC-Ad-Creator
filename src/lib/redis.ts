import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL || 'redis://localhost:6379'

  const client = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  })

  client.on('error', (err) => {
    console.error('Redis connection error:', err)
  })

  client.on('connect', () => {
    console.log('Redis connected')
  })

  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Cache helpers
export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key)
  if (!data) return null
  try {
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

export async function setCache<T>(key: string, data: T, ttlSeconds: number = 3600): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(data))
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key)
}

export async function getCacheOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  const cached = await getCache<T>(key)
  if (cached) return cached

  const data = await fetcher()
  await setCache(key, data, ttlSeconds)
  return data
}
