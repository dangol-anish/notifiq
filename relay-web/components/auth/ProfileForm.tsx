"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  currentName: string;
}

export default function ProfileForm({ currentName }: Props) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const { update } = useSession();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      await update({ name });
      toast.success("Profile updated!");
      router.refresh();
    } else {
      toast.error("Failed to update profile");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500"
          placeholder="Your name"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading || name === currentName}
        className="bg-[#2d4a3e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2d4a3e]/80 cursor-pointer transition-colors disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
