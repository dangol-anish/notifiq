import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis environment variables')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export async function publishPush(userId: string, notification: unknown) {
  await redis.lpush('notifications:push', JSON.stringify({ userId, notification }))
}

export async function publishRead(userId: string, notificationId?: string, action?: 'read-all') {
  await redis.lpush('notifications:read', JSON.stringify({ userId, notificationId, action }))
}