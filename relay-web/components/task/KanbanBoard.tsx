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
import { useState } from "react";
import { useTasks } from "@/context/TaskContext";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";

interface Props {
  projectId: string;
  workspaceSlug: string;
}

const columns = [
  { title: "To Do", status: "todo", color: "bg-gray-400" },
  { title: "In Progress", status: "in_progress", color: "bg-blue-400" },
  { title: "In Review", status: "in_review", color: "bg-yellow-400" },
  { title: "Done", status: "done", color: "bg-green-400" },
];

export default function KanbanBoard({ projectId, workspaceSlug }: Props) {
  const { tasks, setTasks } = useTasks();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(event.active.id as string);
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

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const overColumn = columns.find((c) => c.status === overId);
    if (!overColumn) return;

    const task = tasks.find((t) => t.id === activeId);
    if (!task || task.status === overColumn.status) return;

    await fetch(`/api/tasks/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: overColumn.status }),
    });
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToFirstScrollableAncestor]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-hidden pb-6 overflow-y-hidden">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={tasks.filter((t) => t.status === col.status)}
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
  );
}
