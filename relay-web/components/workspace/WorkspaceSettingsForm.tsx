"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  slug: string;
  currentName: string;
  isOwner: boolean;
  isAdmin: boolean;
}

export default function WorkspaceSettingsForm({
  slug,
  currentName,
  isOwner,
  isAdmin,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canRename = isOwner || isAdmin;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canRename) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch(`/api/workspaces/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Workspace</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Workspace name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canRename}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
          {!canRename && (
            <p className="text-xs text-gray-400 mt-1">
              Only owners and admins can rename workspaces.
            </p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm">
            Workspace renamed successfully.
          </p>
        )}

        {canRename && (
          <button
            type="submit"
            disabled={loading || name === currentName}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        )}
      </form>
    </div>
  );
}
