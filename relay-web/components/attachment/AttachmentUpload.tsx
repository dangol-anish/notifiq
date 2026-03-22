"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  taskId: string;
  onUploadComplete: (attachment: any) => void;
}

export default function AttachmentUpload({ taskId, onUploadComplete }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { startUpload } = useUploadThing("taskAttachment", {
    onClientUploadComplete: async (files) => {
      for (const file of files) {
        const res = await fetch(`/api/tasks/${taskId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileUrl: file.url,
            fileSize: file.size,
            fileType: file.type,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          onUploadComplete(data.attachment);
          toast.success("File uploaded!");
        } else {
          toast.error("Failed to save attachment");
        }
      }
      setUploading(false);
    },
    onUploadError: (err) => {
      console.error("[upload] error:", err);
      toast.error("Upload failed");
      setUploading(false);
    },
  });

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    await startUpload(Array.from(files));
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
        isDragging
          ? "border-blue-400 bg-blue-50 dark:bg-blue-950/40"
          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
      }`}
    >
      {uploading ? (
        <p className="text-sm text-gray-500">Uploading...</p>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Drag and drop files here, or{" "}
            <label className="text-blue-600 cursor-pointer hover:underline">
              browse
              <input
                type="file"
                className="hidden"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                accept="image/*,.pdf,.txt,.doc,.docx"
              />
            </label>
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Images up to 4MB, PDFs up to 8MB
          </p>
        </>
      )}
    </div>
  );
}
