import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const { labelId } = await req.json();

    await sql`
      INSERT INTO task_labels (task_id, label_id)
      VALUES (${taskId}, ${labelId})
      ON CONFLICT DO NOTHING
    `;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tasks/:taskId/labels]", err);
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
    const { labelId } = await req.json();

    await sql`
      DELETE FROM task_labels
      WHERE task_id = ${taskId} AND label_id = ${labelId}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/tasks/:taskId/labels]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
