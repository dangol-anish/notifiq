"use client";

import { useState } from "react";
import AttachmentUpload from "./AttachmentUpload";
import AttachmentList from "./AttachmentList";

interface Props {
  taskId: string;
  initialAttachments: any[];
}

export default function AttachmentsSection({
  taskId,
  initialAttachments,
}: Props) {
  const [attachments, setAttachments] = useState(initialAttachments);

  function handleUploadComplete(attachment: any) {
    setAttachments((prev) => [attachment, ...prev]);
  }

  function handleDelete(attachmentId: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Attachments ({attachments.length})
      </h2>
      <div className="space-y-4">
        <AttachmentList
          attachments={attachments}
          taskId={taskId}
          onDelete={handleDelete}
        />
        <AttachmentUpload
          taskId={taskId}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </div>
  );
}
