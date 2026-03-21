import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { publishTaskUpdated, publishTaskDeleted } from "@/lib/redis";
import { logActivity } from "@/lib/activity";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const { status, priority, assigneeId, title, description, dueDate } =
      await req.json();

    const rows = await sql`
      UPDATE tasks SET
        status = COALESCE(${status ?? null}, status),
        priority = COALESCE(${priority ?? null}, priority),
        assignee_id = COALESCE(${assigneeId ?? null}, assignee_id),
        title = COALESCE(${title ?? null}, title),
        description = COALESCE(${description ?? null}, description),
        due_date = COALESCE(${dueDate ?? null}, due_date),
        updated_at = NOW()
      WHERE id = ${taskId}
      RETURNING *
    `;

    if (!rows.length)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Get workspace_id for publishing
    const taskFull = await sql`
      SELECT t.*, p.workspace_id FROM tasks t
      JOIN projects p ON p.id = t.project_id
      WHERE t.id = ${taskId}
    `;

    if (taskFull.length) {
      await publishTaskUpdated(taskFull[0].workspace_id, rows[0]);
    }

    await logActivity({
      workspaceId: taskFull[0].workspace_id,
      actorId: userId,
      type: "task_updated",
      entityType: "task",
      entityId: taskId,
      payload: { status, priority },
    });

    return NextResponse.json({ task: rows[0] });
  } catch (err) {
    console.error("[PATCH /api/tasks/:taskId]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;

    // Get task info before deleting
    const taskInfo = await sql`
      SELECT t.project_id, p.workspace_id FROM tasks t
      JOIN projects p ON p.id = t.project_id
      WHERE t.id = ${taskId}
    `;

    await sql`DELETE FROM tasks WHERE id = ${taskId}`;

    if (taskInfo.length) {
      await publishTaskDeleted(
        taskInfo[0].workspace_id,
        taskId,
        taskInfo[0].project_id,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/tasks/:taskId]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
