"use client";

interface Props {
  open: boolean;
  onClose: () => void;
}

const rows = [
  { keys: "?", desc: "Open this shortcuts list (when not typing in a field)" },
  { keys: "g then d", desc: "Go to dashboard" },
  { keys: "Esc", desc: "Close this dialog" },
];

export default function KeyboardShortcutsModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="shortcuts-title"
          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          Keyboard shortcuts
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Press keys while focus is not in an input or text area.
        </p>
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li
              key={row.keys}
              className="flex items-start justify-between gap-4 text-sm"
            >
              <span className="text-gray-600 dark:text-gray-300">{row.desc}</span>
              <kbd className="shrink-0 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                {row.keys}
              </kbd>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
