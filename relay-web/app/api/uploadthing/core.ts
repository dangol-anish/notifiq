import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUserId } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  taskAttachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    pdf: { maxFileSize: "8MB", maxFileCount: 5 },
    text: { maxFileSize: "2MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        "[uploadthing] upload complete:",
        file.url,
        "by",
        metadata.userId,
      );
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
