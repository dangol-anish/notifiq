"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  taskId: string;
  readOnly?: boolean;
}

export default function AISummary({ taskId, readOnly }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchSummary() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/summarize-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not summarize task");
        return;
      }
      if (typeof data.summary === "string" && data.summary.trim()) {
        setSummary(data.summary.trim());
      } else {
        toast.error("No summary returned");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (readOnly) return null;

  return (
    <div className="mt-4">
      {!summary ? (
        <button
          type="button"
          onClick={fetchSummary}
          disabled={loading}
          className="text-sm font-medium text-sky-600 hover:text-sky-700 disabled:opacity-50 dark:text-sky-400 dark:hover:text-sky-300"
        >
          {loading ? "Summarizing…" : "Summarize with AI"}
        </button>
      ) : (
        <div className="relative rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-900 dark:bg-sky-950/40">
          <button
            type="button"
            onClick={() => setSummary(null)}
            className="absolute right-2 top-2 rounded p-1 text-sky-600/70 hover:bg-sky-100 hover:text-sky-800 dark:text-sky-400 dark:hover:bg-sky-900/50 dark:hover:text-sky-200"
            aria-label="Dismiss summary"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <p className="pr-8 text-sm leading-relaxed text-sky-900 dark:text-sky-100">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}
