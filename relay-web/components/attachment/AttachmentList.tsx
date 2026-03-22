"use client";

import toast from "react-hot-toast";

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  uploader_name: string;
  created_at: string;
}

interface Props {
  attachments: Attachment[];
  taskId: string;
  onDelete: (attachmentId: string) => void;
  readOnly?: boolean;
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(fileType?: string) {
  if (!fileType) return "📎";
  if (fileType.startsWith("image/")) return "🖼️";
  if (fileType === "application/pdf") return "📄";
  return "📎";
}

export default function AttachmentList({
  attachments,
  taskId,
  onDelete,
  readOnly = false,
}: Props) {
  if (!attachments.length) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500">No attachments yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {attachments.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{fileIcon(a.file_type)}</span>

            <div className="min-w-0">
              <a
                href={a.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {a.file_name}
              </a>

              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatFileSize(a.file_size)} · {a.uploader_name}
              </p>
            </div>
          </div>

          {!readOnly && (
            <button
              onClick={async () => {
                const res = await fetch(`/api/tasks/${taskId}/attachments`, {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ attachmentId: a.id }),
                });
                if (res.ok) {
                  toast.success("Attachment deleted");
                  onDelete(a.id);
                } else {
                  toast.error("Failed to delete attachment");
                }
              }}
              className="text-gray-400 hover:text-red-500 transition-colors ml-2 shrink-0"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
