import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { registerRoomHandlers } from './rooms'
import { startPubSubPolling } from './pubsub'
import { healthRouter } from './health'

const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'

const app = express()
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())
app.use(healthRouter)

const httpServer = createServer(app)

export const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log(`[ws] client connected: ${socket.id}`)
  registerRoomHandlers(io, socket)

  socket.on('disconnect', () => {
    console.log(`[ws] client disconnected: ${socket.id}`)
  })
})

startPubSubPolling(io)

httpServer.listen(PORT, () => {
  console.log(`[ws] relay-ws running on port ${PORT}`)
})