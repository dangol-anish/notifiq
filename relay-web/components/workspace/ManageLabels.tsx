"use client";

import { useState, useEffect } from "react";
import LabelBadge from "@/components/ui/LabelBadge";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Props {
  slug: string;
}

const PRESET_COLORS = [
  "#6366f1",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function ManageLabels({ slug }: Props) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/workspaces/${slug}/labels`)
      .then((res) => res.json())
      .then((data) => setLabels(data.labels || []));
  }, [slug]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/workspaces/${slug}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });

    const data = await res.json();
    if (res.ok) {
      setLabels((prev) => [...prev, data.label]);
      setName("");
    }

    setLoading(false);
  }

  async function handleDelete(labelId: string) {
    await fetch(`/api/workspaces/${slug}/labels`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labelId }),
    });

    setLabels((prev) => prev.filter((l) => l.id !== labelId));
  }

  return (
    <div className=" border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className=" font-serif mb-4 text-lg font-bold font-semibold text- dark:text-gray-100">
        Labels
      </h2>

      {/* Existing labels */}
      <div className="flex flex-wrap gap-2 mb-4">
        {labels.length === 0 ? (
          <p className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
            No labels yet.
          </p>
        ) : (
          labels.map((label) => (
            <LabelBadge
              key={label.id}
              name={label.name}
              color={label.color}
              onRemove={() => handleDelete(label.id)}
            />
          ))
        )}
      </div>

      {/* Create label form */}
      <form onSubmit={handleCreate} className="flex items-end gap-3">
        <div className="flex-1 items-center justify-center">
          <label className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
            Label name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full  border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#604021]/70 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="e.g. Bug, Feature, Urgent"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
            Color
          </label>
          <div className="flex gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `2px solid ${c}` : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className=" bg-primary text-white  px-4 py-2 cursor-pointer text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
}
