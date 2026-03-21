"use client";

import { formatDistanceToNow } from "date-fns";

interface Props {
  event: any;
}

const activityLabels: Record<string, string> = {
  task_created: "created a task",
  task_updated: "updated a task",
  comment_added: "commented on a task",
  task_assigned: "assigned a task",
};

export default function ActivityItem({ event }: Props) {
  const label = activityLabels[event.type] || event.type;

  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium shrink-0">
        {event.actor_name?.charAt(0).toUpperCase() || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700">
          <span className="font-medium">{event.actor_name}</span> {label}
          {event.payload?.title && (
            <span className="text-gray-500"> — {event.payload.title}</span>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
