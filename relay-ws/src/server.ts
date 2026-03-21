import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerRoomHandlers } from "./rooms";
import { healthRouter } from "./health";

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(healthRouter);

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[ws] client connected: ${socket.id}`);
  registerRoomHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`[ws] client disconnected: ${socket.id}`);
  });
});

// Direct HTTP delivery endpoint — called by Vercel API routes
// Replaces Redis polling entirely, zero idle commands
// app.post('/deliver', (req, res) => {
//   const { channel, message } = req.body

//   if (!channel || !message) {
//     return res.status(400).json({ error: 'Missing channel or message' })
//   }

//   if (channel === 'notifications:push') {
//     const { userId, notification } = message
//     io.to(`room:${userId}`).emit('notification:new', notification)
//     console.log(`[deliver] notification:new to room:${userId}`)
//   }

//   if (channel === 'notifications:read') {
//     const { userId, notificationId, action } = message
//     io.to(`room:${userId}`).emit('notification:read', { notificationId, action })
//     console.log(`[deliver] notification:read to room:${userId}`)
//   }

//   res.status(200).json({ ok: true })
// })

app.post("/deliver", (req, res) => {
  const { channel, message } = req.body;

  if (!channel || !message) {
    return res.status(400).json({ error: "Missing channel or message" });
  }

  if (channel === "notifications:push") {
    const { userId, notification } = message;
    io.to(`room:${userId}`).emit("notification:new", notification);
    console.log(`[deliver] notification:new to room:${userId}`);
  }

  if (channel === "notifications:read") {
    const { userId, notificationId, action } = message;
    io.to(`room:${userId}`).emit("notification:read", {
      notificationId,
      action,
    });
    console.log(`[deliver] notification:read to room:${userId}`);
  }

  if (channel === "task:updated") {
    const { workspaceId, task } = message;
    io.to(`workspace:${workspaceId}`).emit("task:updated", task);
    console.log(`[deliver] task:updated to workspace:${workspaceId}`);
  }

  if (channel === "task:deleted") {
    const { workspaceId, taskId, projectId } = message;
    io.to(`workspace:${workspaceId}`).emit("task:deleted", {
      taskId,
      projectId,
    });
    console.log(`[deliver] task:deleted to workspace:${workspaceId}`);
  }

  res.status(200).json({ ok: true });
});

httpServer.listen(PORT, () => {
  console.log(`[ws] relay-ws running on port ${PORT}`);
});
