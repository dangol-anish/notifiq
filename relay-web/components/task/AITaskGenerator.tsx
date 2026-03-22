"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  projectId: string;
  workspaceSlug: string;
}

export default function AITaskGenerator({ projectId, workspaceSlug }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const g = goal.trim();
    if (!g) {
      toast.error("Describe your goal first");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: g, projectId, workspaceSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not generate tasks");
        return;
      }
      const n = Array.isArray(data.tasks) ? data.tasks.length : 0;
      toast.success(n ? `Created ${n} tasks` : "Tasks created");
      setOpen(false);
      setGoal("");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800 transition-colors hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200 dark:hover:bg-violet-950"
      >
        AI generate tasks
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => {
            if (!loading) {
              setOpen(false);
              setGoal("");
            }
          }}
        >
          <div
            className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Generate tasks with AI
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Describe what you want to accomplish. We&apos;ll suggest 5–10
              actionable tasks with priorities and due dates.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Ship the billing integration with Stripe, emails, and admin refunds…"
                rows={5}
                disabled={loading}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!loading) {
                      setOpen(false);
                      setGoal("");
                    }
                  }}
                  className="px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
                >
                  {loading ? "Generating tasks…" : "Generate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
