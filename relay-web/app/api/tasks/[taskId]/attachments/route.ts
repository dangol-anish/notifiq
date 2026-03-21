import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;

    const attachments = await sql`
      SELECT a.*, u.name as uploader_name
      FROM attachments a
      JOIN users u ON u.id = a.uploaded_by
      WHERE a.task_id = ${taskId}
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json({ attachments });
  } catch (err) {
    console.error("[GET /api/tasks/:taskId/attachments]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const { fileName, fileUrl, fileSize, fileType } = await req.json();

    if (!fileName || !fileUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const rows = await sql`
      INSERT INTO attachments (task_id, uploaded_by, file_name, file_url, file_size, file_type)
      VALUES (${taskId}, ${userId}, ${fileName}, ${fileUrl}, ${fileSize ?? null}, ${fileType ?? null})
      RETURNING *
    `;

    return NextResponse.json({ attachment: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tasks/:taskId/attachments]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const { attachmentId } = await req.json();

    await sql`
      DELETE FROM attachments
      WHERE id = ${attachmentId}
      AND task_id = ${taskId}
      AND uploaded_by = ${userId}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/tasks/:taskId/attachments]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
