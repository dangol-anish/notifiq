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
  urgent: "text-red-500",
  high: "text-orange-500",
  medium: "text-yellow-500",
  low: "text-gray-400",
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
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 w-56">
        <svg
          className="w-3.5 h-3.5 text-gray-400 shrink-0"
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
          className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
        {!query && (
          <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded shrink-0">
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
          <div className="absolute top-10 left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-80 overflow-hidden">
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-400">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">
                No results for "{query}"
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-400 px-4 pt-3 pb-1">Tasks</p>
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {result.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">
                        {result.project_name}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
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
