"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Workspace = { id: string; name: string; slug: string };

interface Props {
  currentSlug: string;
  currentName: string;
  /** Lighter style to match gray breadcrumb links on project/task pages */
  variant?: "default" | "breadcrumb";
}

export default function WorkspaceSwitcher({
  currentSlug,
  currentName,
  variant = "default",
}: Props) {
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => r.json())
      .then((d) => setWorkspaces(d.workspaces ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const btnClass =
    variant === "breadcrumb"
      ? "-mx-1.5 flex max-w-[160px] items-center gap-1 rounded-md px-1.5 py-0.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 sm:max-w-[220px]"
      : "-mx-2 -my-1 flex max-w-[200px] items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800 sm:max-w-[280px]";

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={btnClass}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate">{currentName}</span>
        <span className="text-gray-400 shrink-0 text-[10px] leading-none">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <ul
          className="absolute left-0 top-full z-50 mt-1 min-w-[220px] max-w-[min(90vw,280px)] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
          role="listbox"
        >
          {workspaces.map((w) => (
            <li key={w.id} role="none">
              <Link
                href={`/${w.slug}`}
                role="option"
                aria-selected={w.slug === currentSlug}
                onClick={() => setOpen(false)}
                className={`block truncate px-3 py-2 text-sm ${
                  w.slug === currentSlug
                    ? "bg-gray-50 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {w.name}
              </Link>
            </li>
          ))}
          <li className="my-1 border-t border-gray-100" role="separator" />
          <li role="none">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              All workspaces…
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
