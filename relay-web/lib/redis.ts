import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis environment variables')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const WS_URL = process.env.WS_SERVER_URL || 'http://localhost:3001'

async function deliverToWS(channel: string, message: unknown) {
  try {
    await fetch(`${WS_URL}/deliver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, message }),
    })
  } catch (err) {
    console.error('[redis] failed to deliver to WS server:', err)
  }
}

export async function publishPush(userId: string, notification: unknown) {
  await deliverToWS('notifications:push', { userId, notification })
}

export async function publishRead(userId: string, notificationId?: string, action?: 'read-all') {
  await deliverToWS('notifications:read', { userId, notificationId, action })
}