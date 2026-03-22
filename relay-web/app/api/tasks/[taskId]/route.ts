import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { publishTaskUpdated, publishTaskDeleted } from "@/lib/redis";
import { logActivity } from "@/lib/activity";
import { assertProjectNotArchivedByTaskId } from "@/lib/project-archive";

function dueDateKey(d: unknown): string | null {
  if (d == null) return null;
  const t = new Date(d as string);
  if (Number.isNaN(t.getTime())) return null;
  return t.toISOString().slice(0, 10);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const body = await req.json();
    const { status, priority, assigneeId, title, description, dueDate } = body;
    const dueDateInBody = Object.prototype.hasOwnProperty.call(body, "dueDate");

    const existingDue = await sql`
      SELECT due_date FROM tasks WHERE id = ${taskId}
    `;
    if (!existingDue.length)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const archiveCheck = await assertProjectNotArchivedByTaskId(taskId);
    if (!archiveCheck.ok) {
      return NextResponse.json(
        { error: archiveCheck.message },
        { status: archiveCheck.status },
      );
    }

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

    if (dueDateInBody) {
      const prev = dueDateKey(existingDue[0].due_date);
      const next = dueDateKey(dueDate);
      if (prev !== next) {
        await sql`
          UPDATE tasks SET due_reminder_sent_at = NULL WHERE id = ${taskId}
        `;
      }
    }

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

    const archiveCheck = await assertProjectNotArchivedByTaskId(taskId);
    if (!archiveCheck.ok) {
      return NextResponse.json(
        { error: archiveCheck.message },
        { status: archiveCheck.status },
      );
    }

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
