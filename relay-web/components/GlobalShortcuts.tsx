"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
// import ThemeToggle from "@/components/ThemeToggle";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";

export default function GlobalShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const gPending = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearG() {
      gPending.current = false;
      if (gTimer.current) {
        clearTimeout(gTimer.current);
        gTimer.current = null;
      }
    }

    function onKey(e: KeyboardEvent) {
      const t = e.target;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement
      ) {
        return;
      }
      if ((t as HTMLElement).isContentEditable) return;

      if (e.key === "Escape") {
        setHelpOpen(false);
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setHelpOpen((o) => !o);
        return;
      }

      if (e.key === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        gPending.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => {
          gPending.current = false;
          gTimer.current = null;
        }, 900);
        return;
      }

      if (
        e.key === "d" &&
        gPending.current &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        clearG();
        router.push("/dashboard");
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (gTimer.current) clearTimeout(gTimer.current);
    };
  }, [router]);

  return (
    <>
      <KeyboardShortcutsModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
      <div className="fixed bottom-28 right-4 z-[100] flex items-center gap-2">
        {/* <ThemeToggle /> */}
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className=" border border-gray-200 bg-white p-2 px-3 text-sm font-bold text-gray-600 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts"
        >
          ?
        </button>
      </div>
    </>
  );
}
