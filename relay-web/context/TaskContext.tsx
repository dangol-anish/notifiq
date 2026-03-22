"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee_id?: string;
  assignee_name?: string;
  due_date?: string;
  project_id: string;
  workspace_id: string;
  created_at: string;
  labels?: { id: string; name: string; color: string }[];
}
interface TaskContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  isConnected: boolean;
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({
  children,
  workspaceId,
  initialTasks,
}: {
  children: React.ReactNode;
  workspaceId: string;
  initialTasks: Task[];
}) {
  const { data: session } = useSession();
  const [tasks, setTasksState] = useState<Task[]>(initialTasks);
  const [isConnected, setIsConnected] = useState(false);

  function setTasks(tasks: Task[]) {
    setTasksState(tasks);
  }

  useEffect(() => {
    if (!session?.user?.id) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

    const socket = io(wsUrl, {
      autoConnect: true,
      reconnection: true,
    });

    socket.on("connect", () => {
      setIsConnected(true);

      // Auth for notifications
      socket.emit("auth", {
        userId: session.user.id,
        token: session.user.id,
      });

      // Join workspace room for live task updates
      socket.emit("workspace:join", {
        workspaceId,
        userId: session.user.id,
        token: session.user.id,
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Live task update from another user
    socket.on("task:updated", (updatedTask: Task) => {
      console.log("[ws] task:updated", updatedTask);
      setTasksState((prev) => {
        const exists = prev.find((t) => t.id === updatedTask.id);
        if (exists) {
          return prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
        }
        return [updatedTask, ...prev];
      });
    });

    // Live task deletion
    socket.on("task:deleted", ({ taskId }: { taskId: string }) => {
      console.log("[ws] task:deleted", taskId);
      setTasksState((prev) => prev.filter((t) => t.id !== taskId));
    });

    return () => {
      socket.disconnect();
    };
  }, [session?.user?.id, workspaceId]);

  return (
    <TaskContext.Provider value={{ tasks, setTasks, isConnected }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}
