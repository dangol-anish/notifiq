"use client";

import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import LabelBadge from "@/components/ui/LabelBadge";

interface Props {
  task: any;
  workspaceSlug: string;
  projectId: string;
}

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

export default function TaskCard({ task, workspaceSlug, projectId }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "done";

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        <Link
          href={`/${workspaceSlug}/projects/${projectId}/tasks/${task.id}`}
          onClick={(e) => {
            if (transform) e.preventDefault();
          }}
        >
          <div
            className={`bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:shadow-sm transition-all ${isDragging ? "" : "cursor-pointer"}`}
          >
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {task.title}
            </p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || priorityColors.medium}`}
              >
                {task.priority}
              </span>

              {task.due_date && (
                <span
                  className={`text-xs ${isOverdue ? "text-red-500" : "text-gray-400"}`}
                >
                  {isOverdue ? "⚠ " : ""}
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
            </div>

            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.labels.map((label: any) => (
                  <LabelBadge
                    key={label.id}
                    name={label.name}
                    color={label.color}
                  />
                ))}
              </div>
            )}

            {task.assignee_name && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                  {task.assignee_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-500">
                  {task.assignee_name}
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
