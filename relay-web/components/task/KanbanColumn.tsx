"use client";

import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";

interface Props {
  title: string;
  status: string;
  tasks: any[];
  workspaceSlug: string;
  projectId: string;
  color: string;
  readOnly?: boolean;
}

export default function KanbanColumn({
  title,
  status,
  tasks,
  workspaceSlug,
  projectId,
  color,
  readOnly = false,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    disabled: readOnly,
  });

  return (
    <div className="flex-1 min-w-[240px] max-w-[320px]">
      <div className="flex items-center gap-2 mb-3">
        {/* <span className={`w-2 h-2 rounded-full ${color}`} /> */}
        <h3 className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
          {title}
        </h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[100px] space-y-2 rounded-lg p-2 transition-colors ${
          isOver
            ? "border-2 border-dashed border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
            : "border-2 border-transparent"
        }`}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            workspaceSlug={workspaceSlug}
            projectId={projectId}
            readOnly={readOnly}
          />
        ))}
        {tasks.length === 0 && !isOver && (
          <div className="border-2 border-dashed border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-400 text-on-tertiary-fixed-variant tracking-widest">
              {readOnly ? "No tasks" : "Drop tasks here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
