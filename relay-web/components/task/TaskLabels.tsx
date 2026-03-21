"use client";

import { useState, useEffect } from "react";
import LabelBadge from "@/components/ui/LabelBadge";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Props {
  taskId: string;
  workspaceSlug: string;
  initialLabels: Label[];
}

export default function TaskLabels({
  taskId,
  workspaceSlug,
  initialLabels,
}: Props) {
  const [labels, setLabels] = useState<Label[]>(initialLabels);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceSlug}/labels`)
      .then((res) => res.json())
      .then((data) => setAllLabels(data.labels || []));
  }, [workspaceSlug]);

  async function addLabel(label: Label) {
    if (labels.find((l) => l.id === label.id)) return;
    setLoading(true);

    await fetch(`/api/tasks/${taskId}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labelId: label.id }),
    });

    setLabels((prev) => [...prev, label]);
    setShowDropdown(false);
    setLoading(false);
  }

  async function removeLabel(labelId: string) {
    await fetch(`/api/tasks/${taskId}/labels`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labelId }),
    });

    setLabels((prev) => prev.filter((l) => l.id !== labelId));
  }

  const unattachedLabels = allLabels.filter(
    (l) => !labels.find((tl) => tl.id === l.id),
  );

  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">Labels</p>
      <div className="flex flex-wrap gap-1.5 items-center">
        {labels.map((label) => (
          <LabelBadge
            key={label.id}
            name={label.name}
            color={label.color}
            onRemove={() => removeLabel(label.id)}
          />
        ))}

        <div className="relative">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-300 px-2 py-0.5 rounded-full transition-colors"
          >
            + Add label
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute top-6 left-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[160px]">
                {unattachedLabels.length === 0 ? (
                  <p className="text-xs text-gray-400 px-2 py-1">
                    {allLabels.length === 0
                      ? "No labels yet. Create them in workspace settings."
                      : "All labels added"}
                  </p>
                ) : (
                  unattachedLabels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => addLabel(label)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm text-gray-700">
                        {label.name}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
