import { Server, Socket } from "socket.io";
import { verifyToken } from "./auth";

export function registerRoomHandlers(io: Server, socket: Socket) {
  // Join user's personal notification room
  socket.on(
    "auth",
    async ({ userId, token }: { userId: string; token: string }) => {
      const payload = verifyToken(token, userId);

      if (!payload) {
        console.warn(`[rooms] auth failed for socket ${socket.id}`);
        socket.emit("auth:error", { message: "Invalid token" });
        return;
      }

      const room = `room:${userId}`;
      await socket.join(room);
      console.log(`[rooms] socket ${socket.id} joined ${room}`);
      socket.emit("auth:success", { userId });
    },
  );

  // Join workspace room for live task updates
  socket.on(
    "workspace:join",
    async ({
      workspaceId,
      userId,
      token,
    }: {
      workspaceId: string;
      userId: string;
      token: string;
    }) => {
      const payload = verifyToken(token, userId);

      if (!payload) {
        console.warn(
          `[rooms] workspace:join auth failed for socket ${socket.id}`,
        );
        return;
      }

      const room = `workspace:${workspaceId}`;
      await socket.join(room);
      console.log(`[rooms] socket ${socket.id} joined ${room}`);
    },
  );
}
