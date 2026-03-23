"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
      toast.error(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    toast.success("Workspace renamed!");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className=" border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className=" font-serif mb-4 text-lg font-bold font-semibold text- dark:text-gray-100">
        Workspace
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
            Workspace name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canRename}
            className="w-full  border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#604021]/70 disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 disabled:dark:bg-gray-800/50"
          />
          {!canRename && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
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
            className=" bg-primary text-white  px-4 py-2 cursor-pointer text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        )}
      </form>
    </div>
  );
}
