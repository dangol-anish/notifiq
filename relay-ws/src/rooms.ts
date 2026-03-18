import { Server, Socket } from 'socket.io'
import { verifyToken } from './auth'

export function registerRoomHandlers(io: Server, socket: Socket) {
  socket.on('auth', async ({ userId, token }: { userId: string; token: string }) => {
    const payload = verifyToken(token, userId)

    if (!payload) {
      console.warn(`[rooms] auth failed for socket ${socket.id}`)
      socket.emit('auth:error', { message: 'Invalid token' })
      return
    }

    const room = `room:${userId}`
    await socket.join(room)

    console.log(`[rooms] socket ${socket.id} joined ${room}`)
    socket.emit('auth:success', { userId })
  })
}