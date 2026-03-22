import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { dispatchNotificationEvent } from "@/lib/dispatch-notification-event";

/**
 * Daily: notify assignee (or creator) the calendar day before a task is due.
 * Secured with Authorization: Bearer CRON_SECRET (set in Vercel + .env.local).
 * Schedule: vercel.json → 08:00 UTC (adjust cron there).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT
        t.id,
        t.title,
        t.assignee_id,
        t.created_by,
        t.project_id,
        w.slug AS workspace_slug
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      JOIN workspaces w ON w.id = p.workspace_id
      WHERE t.due_date IS NOT NULL
        AND t.due_reminder_sent_at IS NULL
        AND t.status IS DISTINCT FROM 'done'
        AND COALESCE(p.status, 'active') != 'archived'
        AND (t.due_date::date) = (CURRENT_DATE + interval '1 day')::date
    `;

    let sent = 0;
    const errors: string[] = [];

    for (const row of rows as {
      id: string;
      title: string;
      assignee_id: string | null;
      created_by: string | null;
      project_id: string;
      workspace_slug: string;
    }[]) {
      const recipientId = row.assignee_id || row.created_by;
      if (!recipientId || !row.created_by) continue;

      try {
        await dispatchNotificationEvent({
          type: "task_due_soon",
          senderId: row.created_by,
          recipientIds: [recipientId],
          title: "Task due tomorrow",
          body: `"${row.title}" is due tomorrow`,
          payload: {
            taskId: row.id,
            projectId: row.project_id,
            workspaceSlug: row.workspace_slug,
          },
        });

        await sql`
          UPDATE tasks SET due_reminder_sent_at = NOW() WHERE id = ${row.id}
        `;
        sent++;
      } catch (e) {
        console.error("[cron/due-reminders] task", row.id, e);
        errors.push(row.id);
      }
    }

    return NextResponse.json({
      ok: true,
      checked: rows.length,
      sent,
      failed: errors.length,
    });
  } catch (err) {
    console.error("[GET /api/cron/due-reminders]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
