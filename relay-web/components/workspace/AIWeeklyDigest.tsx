"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  workspaceSlug: string;
}

function SparkleIcon({
  className,
  loading,
}: {
  className?: string;
  loading?: boolean;
}) {
  return (
    <svg
      className={`${className} ${loading ? "animate-spin" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}

export default function AIWeeklyDigest({ workspaceSlug }: Props) {
  const [digest, setDigest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchDigest() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/weekly-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not load digest");
        return;
      }
      if (typeof data.digest === "string" && data.digest.trim()) {
        setDigest(data.digest.trim());
      } else {
        toast.error("No digest returned");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="">
      <button
        type="button"
        onClick={fetchDigest}
        disabled={loading}
        className="cursor-pointer inline-flex items-center gap-2 rounded-lg  px-2 py-2 text-sm font-medium text-indigo-800 transition-colors hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-950/70"
      >
        <SparkleIcon className="h-4 w-4 shrink-0" loading={loading} />
      </button>
      {digest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-primary font-serif dark:text-gray-100">
                Weekly Digest
              </h2>
              <button
                type="button"
                onClick={() => setDigest(null)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#604021] mb-2">
              Last 7 days
            </label>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 tracking-wider">
              {digest}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
