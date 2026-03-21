import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;

    const comments = await sql`
      SELECT cm.*, u.name as author_name, u.image as author_image
      FROM comments cm
      JOIN users u ON u.id = cm.author_id
      WHERE cm.task_id = ${taskId}
      ORDER BY cm.created_at ASC
    `;

    return NextResponse.json({ comments });
  } catch (err) {
    console.error("[GET /api/tasks/:taskId/comments]", err);
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
    const { body } = await req.json();

    if (!body?.trim())
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 },
      );

    const rows = await sql`
      INSERT INTO comments (task_id, author_id, body)
      VALUES (${taskId}, ${userId}, ${body})
      RETURNING *
    `;

    const comment = rows[0];

    // Get task details for notification
    const taskRows = await sql`
      SELECT t.*, p.workspace_id FROM tasks t
      JOIN projects p ON p.id = t.project_id
      WHERE t.id = ${taskId}
    `;

    if (taskRows.length) {
      const task = taskRows[0];
      const recipients = new Set<string>();

      // Notify assignee and creator (but not the commenter)
      if (task.assignee_id && task.assignee_id !== userId)
        recipients.add(task.assignee_id);
      if (task.created_by && task.created_by !== userId)
        recipients.add(task.created_by);

      // Parse @mentions from body
      const mentions = body.match(/@(\w+)/g) || [];
      if (mentions.length) {
        const usernames = mentions.map((m: string) => m.slice(1));
        const mentionedUsers = await sql`
          SELECT id FROM users WHERE name = ANY(${usernames}::text[])
        `;
        mentionedUsers.forEach((u: any) => {
          if (u.id !== userId) recipients.add(u.id);
        });
      }

      if (recipients.size > 0) {
        await fetch(`${process.env.NEXTAUTH_URL}/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "comment_added",
            senderId: userId,
            recipientIds: Array.from(recipients),
            title: "New comment on a task",
            body: body.slice(0, 100),
            payload: { taskId, commentId: comment.id },
          }),
        });
      }
      await logActivity({
        workspaceId: task.workspace_id,
        actorId: userId,
        type: "comment_added",
        entityType: "comment",
        entityId: comment.id,
        payload: { taskId, body: body.slice(0, 100) },
      });
    }

    // Return comment with author info
    const fullComment = await sql`
      SELECT cm.*, u.name as author_name, u.image as author_image
      FROM comments cm
      JOIN users u ON u.id = cm.author_id
      WHERE cm.id = ${comment.id}
    `;

    return NextResponse.json({ comment: fullComment[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tasks/:taskId/comments]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
