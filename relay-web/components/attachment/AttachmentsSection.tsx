"use client";

import { useState } from "react";
import AttachmentUpload from "./AttachmentUpload";
import AttachmentList from "./AttachmentList";

interface Props {
  taskId: string;
  initialAttachments: any[];
  readOnly?: boolean;
}

export default function AttachmentsSection({
  taskId,
  initialAttachments,
  readOnly = false,
}: Props) {
  const [attachments, setAttachments] = useState(initialAttachments);

  function handleUploadComplete(attachment: any) {
    setAttachments((prev) => [attachment, ...prev]);
  }

  function handleDelete(attachmentId: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Attachments ({attachments.length})
      </h2>
      <div className="space-y-4">
        <AttachmentList
          attachments={attachments}
          taskId={taskId}
          onDelete={handleDelete}
          readOnly={readOnly}
        />
        {!readOnly && (
          <AttachmentUpload
            taskId={taskId}
            onUploadComplete={handleUploadComplete}
          />
        )}
      </div>
    </div>
  );
}
