"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/context/TaskContext";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import KanbanFilters from "./KanbanFilters";
import toast from "react-hot-toast";

interface Props {
  projectId: string;
  workspaceSlug: string;
  members: any[];
  labels: any[];
}

const columns = [
  { title: "To Do", status: "todo", color: "bg-gray-400" },
  { title: "In Progress", status: "in_progress", color: "bg-blue-400" },
  { title: "In Review", status: "in_review", color: "bg-yellow-400" },
  { title: "Done", status: "done", color: "bg-green-400" },
];

export default function KanbanBoard({
  projectId,
  workspaceSlug,
  members,
  labels,
}: Props) {
  const { tasks, setTasks } = useTasks();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    assigneeId: "",
    priority: "",
    labelId: "",
  });
  const router = useRouter();
  const originalStatusRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const filteredTasks = tasks.filter((t) => {
    if (filters.assigneeId === "unassigned" && t.assignee_id) return false;
    if (
      filters.assigneeId &&
      filters.assigneeId !== "unassigned" &&
      t.assignee_id !== filters.assigneeId
    )
      return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (
      filters.labelId &&
      !t.labels?.find((l: any) => l.id === filters.labelId)
    )
      return false;
    return true;
  });

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    setActiveTaskId(id);
    const task = tasks.find((t) => t.id === id);
    originalStatusRef.current = task?.status ?? null;
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const overColumn = columns.find((c) => c.status === overId);
    if (!overColumn) return;

    setTasks(
      tasks.map((t) =>
        t.id === activeId ? { ...t, status: overColumn.status } : t,
      ),
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) {
      if (originalStatusRef.current && active.id) {
        setTasks(
          tasks.map((t) =>
            t.id === active.id
              ? { ...t, status: originalStatusRef.current! }
              : t,
          ),
        );
      }
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const overColumn = columns.find((c) => c.status === overId);
    if (!overColumn) return;

    if (originalStatusRef.current === overColumn.status) return;

    const res = await fetch(`/api/tasks/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: overColumn.status }),
    });

    if (!res.ok) {
      toast.error("Failed to update task status");
      setTasks(
        tasks.map((t) =>
          t.id === activeId ? { ...t, status: originalStatusRef.current! } : t,
        ),
      );
    } else {
      toast.success("Status updated!");
    }

    originalStatusRef.current = null;
  }

  return (
    <div>
      <KanbanFilters
        members={members}
        labels={labels}
        filters={filters}
        onChange={setFilters}
      />

      <DndContext
        sensors={sensors}
        modifiers={[restrictToFirstScrollableAncestor]}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 overflow-y-hidden">
          {columns.map((col) => (
            <KanbanColumn
              key={col.status}
              title={col.title}
              status={col.status}
              tasks={filteredTasks.filter((t) => t.status === col.status)}
              workspaceSlug={workspaceSlug}
              projectId={projectId}
              color={col.color}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask && (
            <div className="opacity-90 rotate-1 scale-105">
              <TaskCard
                task={activeTask}
                workspaceSlug={workspaceSlug}
                projectId={projectId}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
