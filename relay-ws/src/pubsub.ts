import { Server } from 'socket.io'
import { redis } from './redis'

const POLL_INTERVAL_MS = 300

export function startPubSubPolling(io: Server) {
  console.log('[pubsub] starting Redis polling...')

  setInterval(async () => {
    try {
      const messages = await redis.rpop('notifications:push', 10)
      if (!messages) return

      const list = Array.isArray(messages) ? messages : [messages]
      for (const raw of list) {
        try {
          const message = typeof raw === 'string' ? JSON.parse(raw) : raw
          const { userId, notification } = message
          io.to(`room:${userId}`).emit('notification:new', notification)
          console.log(`[pubsub] pushed notification:new to room:${userId}`)
        } catch (err) {
          console.error('[pubsub] failed to parse push message:', err)
        }
      }
    } catch (err) {
      console.error('[pubsub] poll error on notifications:push:', err)
    }
  }, POLL_INTERVAL_MS)

  setInterval(async () => {
    try {
      const messages = await redis.rpop('notifications:read', 10)
      if (!messages) return

      const list = Array.isArray(messages) ? messages : [messages]
      for (const raw of list) {
        try {
          const message = typeof raw === 'string' ? JSON.parse(raw) : raw
          const { userId, notificationId, action } = message
          io.to(`room:${userId}`).emit('notification:read', { notificationId, action })
          console.log(`[pubsub] pushed notification:read to room:${userId}`)
        } catch (err) {
          console.error('[pubsub] failed to parse read message:', err)
        }
      }
    } catch (err) {
      console.error('[pubsub] poll error on notifications:read:', err)
    }
  }, POLL_INTERVAL_MS)
}