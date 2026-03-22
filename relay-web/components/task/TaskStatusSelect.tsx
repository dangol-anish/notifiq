"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  taskId: string;
  currentStatus: string;
}

const statuses = [
  { value: "todo", label: "To Do", color: "bg-gray-100 text-gray-700" },
  {
    value: "in_progress",
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "in_review",
    label: "In Review",
    color: "bg-yellow-100 text-yellow-700",
  },
  { value: "done", label: "Done", color: "bg-green-100 text-green-700" },
];

export default function TaskStatusSelect({ taskId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const current = statuses.find((s) => s.value === status) || statuses[0];

  async function handleChange(newStatus: string) {
    setLoading(true);
    setStatus(newStatus);

    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      toast.success("Status updated!");
    } else {
      toast.error("Failed to update status");
      setStatus(currentStatus);
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className={`text-sm px-3 py-1.5 rounded-lg font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${current.color}`}
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
