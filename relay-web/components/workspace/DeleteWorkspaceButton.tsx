"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  slug: string;
  workspaceName: string;
}

export default function DeleteWorkspaceButton({ slug, workspaceName }: Props) {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    if (confirm !== workspaceName) return;
    setLoading(true);

    const res = await fetch(`/api/workspaces/${slug}`, { method: "DELETE" });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      toast.error("Failed to delete workspace");
      setLoading(false);
    }
  }

  return (
    <div>
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-red-600 text-white px-4 py-2 cursor-pointer text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Delete workspace
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Type <strong>{workspaceName}</strong> to confirm deletion:
          </p>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder={workspaceName}
          />
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={confirm !== workspaceName || loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Confirm delete"}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirm("");
              }}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
