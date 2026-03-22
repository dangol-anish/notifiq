"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Result {
  id: string;
  title: string;
  status: string;
  priority: string;
  project_id: string;
  project_name: string;
}

interface Props {
  slug: string;
}

const priorityColors: Record<string, string> = {
  urgent: "text-red-500 dark:text-red-400",
  high: "text-orange-500 dark:text-orange-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-gray-400 dark:text-gray-500",
};

export default function SearchBar({ slug }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(
        `/api/workspaces/${slug}/search?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setResults(data.results || []);
      setIsOpen(true);
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, slug]);

  // Keyboard shortcut: Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSelect(result: Result) {
    setIsOpen(false);
    setQuery("");
    router.push(`/${slug}/projects/${result.project_id}/tasks/${result.id}`);
  }

  return (
    <div className="relative">
      <div className="flex w-56 items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 dark:bg-gray-800">
        <svg
          className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none dark:text-gray-200 dark:placeholder-gray-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
        {!query && (
          <span className="shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-400 dark:bg-gray-700 dark:text-gray-400">
            ⌘K
          </span>
        )}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-10 z-20 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                No results for "{query}"
              </div>
            ) : (
              <div>
                <p className="px-4 pb-1 pt-3 text-xs text-gray-400 dark:text-gray-500">
                  Tasks
                </p>
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <p className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {result.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {result.project_name}
                      </span>
                      <span className="text-xs text-gray-300 dark:text-gray-600">
                        ·
                      </span>
                      <span
                        className={`text-xs font-medium ${priorityColors[result.priority]}`}
                      >
                        {result.priority}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
