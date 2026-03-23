"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CommentItem from "./CommentItem";
import toast from "react-hot-toast";

interface Props {
  taskId: string;
  initialComments: any[];
  currentUserId: string;
  currentUserName: string;
  readOnly?: boolean;
}

export default function CommentThread({
  taskId,
  initialComments,
  currentUserId,
  currentUserName,
  readOnly = false,
}: Props) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    const data = await res.json();

    if (res.ok) {
      setComments((prev) => [...prev, data.comment]);
      setBody("");
      toast.success("Comment posted!");
    } else {
      toast.error("Failed to post comment");
    }

    setLoading(false);
  }

  return (
    <div className=" border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-4 text-lg font-semibold text-primary font-serif dark:text-gray-100">
        Comments ({comments.length})
      </h2>

      <div className="mb-6 space-y-4">
        {comments.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No comments yet.
            </p>
            <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">
              Start the conversation below.
            </p>
          </div>
        ) : (
          comments.map((c) => <CommentItem key={c.id} comment={c} />)
        )}
      </div>

      {!readOnly ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium shrink-0">
            {currentUserName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a comment... Use @name to mention someone"
              className="w-full resize-none  border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#604021]/70 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500"
              rows={3}
            />
            <button
              type="submit"
              disabled={loading || !body.trim()}
              className="mt-2 bg-primary text-white px-4 py-1.5  text-sm font-medium hover:bg-primary/70 cursor-pointer transition-colors disabled:opacity-50"
            >
              {loading ? "Posting..." : "Comment"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Comments are read-only while the project is archived.
        </p>
      )}
    </div>
  );
}
