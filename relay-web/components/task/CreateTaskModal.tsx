"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Member {
  id: string;
  name: string;
  email: string;
}

interface Props {
  projectId: string;
  workspaceSlug: string;
  members: Member[];
}

export default function CreateTaskModal({
  projectId,
  workspaceSlug,
  members,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/tasks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          assigneeId: assigneeId || null,
          dueDate: dueDate || null,
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    toast.success("Task created!");
    setIsOpen(false);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssigneeId("");
    setDueDate("");
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary cursor-pointer text-white px-4 py-2  text-sm font-medium hover:bg-primary/70  transition-colors"
      >
        New Task
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className=" font-serif mb-4 text-lg font-bold font-semibold text- dark:text-gray-100">
              Create Task
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full  border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#604021]/70  dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500"
                  placeholder="Task title"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
                  Description{" "}
                  <span className="text-gray-400 dark:text-gray-500">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full resize-none  border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#604021]/70  dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500"
                  placeholder="Describe the task..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full  border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#604021]/70  dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full  border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#604021]/70  dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
                  Assignee{" "}
                  <span className="text-gray-400 dark:text-gray-500">
                    (optional)
                  </span>
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full  border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#604021]/70  dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.email}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className=" bg-primary text-white  px-4 py-2 cursor-pointer text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
