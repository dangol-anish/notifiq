"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  taskId: string;
  projectId: string;
  workspaceSlug: string;
  currentTitle: string;
  currentDescription?: string;
  currentPriority: string;
  currentDueDate?: string;
  members: any[];
  currentAssigneeId?: string;
  canEdit: boolean;
}

export default function TaskActions({
  taskId,
  projectId,
  workspaceSlug,
  currentTitle,
  currentDescription,
  currentPriority,
  currentDueDate,
  members,
  currentAssigneeId,
  canEdit,
}: Props) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription || "");
  const [priority, setPriority] = useState(currentPriority);
  const [dueDate, setDueDate] = useState(currentDueDate?.slice(0, 10) || "");
  const [assigneeId, setAssigneeId] = useState(currentAssigneeId || "");

  if (!canEdit) return null;

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        priority,
        dueDate: dueDate || null,
        assigneeId: assigneeId || null,
      }),
    });

    if (res.ok) {
      toast.success("Task updated!");
    } else {
      toast.error("Failed to update task");
    }

    setShowEdit(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);

    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });

    if (res.ok) {
      toast.success("Task deleted");
      router.push(`/${workspaceSlug}/projects/${projectId}`);
    } else {
      toast.error("Failed to delete task");
      setLoading(false);
    }
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu((p) => !p)}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        >
          ···
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[130px]">
              <button
                onClick={() => {
                  setShowEdit(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit task
              </button>
              <button
                onClick={() => {
                  setShowDelete(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete task
              </button>
            </div>
          </>
        )}
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowEdit(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Task
            </h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDelete && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowDelete(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Delete task?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This task and all its comments and attachments will be permanently
              deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
