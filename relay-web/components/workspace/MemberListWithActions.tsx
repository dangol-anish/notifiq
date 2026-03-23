"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Member {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface Props {
  members: Member[];
  slug: string;
  currentUserId: string;
  isOwner: boolean;
}

export default function MemberListWithActions({
  members,
  slug,
  currentUserId,
  isOwner,
}: Props) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleRemove(memberId: string) {
    setRemoving(memberId);

    const res = await fetch(`/api/workspaces/${slug}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });

    if (res.ok) {
      toast.success("Member removed");
      router.refresh();
    } else {
      toast.error("Failed to remove member");
    }

    setRemoving(null);
    setConfirmId(null);
  }

  return (
    <div className="space-y-3">
      {members.map((m) => (
        <div key={m.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
              {(m.name || m.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
                {m.name || m.email}
              </p>
              <p className="text-xs text-secondary tracking-widest">
                {m.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1  ${
                m.role === "owner"
                  ? "bg-primary/80 text-white"
                  : m.role === "admin"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {m.role}
            </span>

            {isOwner && m.id !== currentUserId && m.role !== "owner" && (
              <>
                {confirmId === m.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Remove?</span>
                    <button
                      onClick={() => handleRemove(m.id)}
                      disabled={removing === m.id}
                      className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      {removing === m.id ? "..." : "Yes"}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(m.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
