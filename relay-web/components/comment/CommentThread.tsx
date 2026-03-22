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
}

export default function CommentThread({
  taskId,
  initialComments,
  currentUserId,
  currentUserName,
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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Comments ({comments.length})
      </h2>

      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400">No comments yet.</p>
            <p className="text-xs text-gray-300 mt-1">
              Start the conversation below.
            </p>
          </div>
        ) : (
          comments.map((c) => <CommentItem key={c.id} comment={c} />)
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium shrink-0">
          {currentUserName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment... Use @name to mention someone"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={loading || !body.trim()}
            className="mt-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Posting..." : "Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}
