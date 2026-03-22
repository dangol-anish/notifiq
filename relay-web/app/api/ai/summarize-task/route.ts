import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getGeminiFlashModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const model = getGeminiFlashModel();
    if (!model)
      return NextResponse.json(
        { error: "AI is not configured (missing GEMINI_API_KEY)" },
        { status: 503 },
      );

    const { taskId } = await req.json();
    if (!taskId || typeof taskId !== "string")
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });

    const taskRows = await sql`
      SELECT t.*
      FROM tasks t
      WHERE t.id = ${taskId}
    `;
    if (!taskRows.length)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const task = taskRows[0];
    const workspaceId = task.workspace_id as string;

    const access = await sql`
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = ${workspaceId} AND wm.user_id = ${userId}
    `;
    if (!access.length)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const comments = await sql`
      SELECT cm.body, cm.created_at, u.name as author_name
      FROM comments cm
      JOIN users u ON u.id = cm.author_id
      WHERE cm.task_id = ${taskId}
      ORDER BY cm.created_at ASC
    `;

    const activity = await sql`
      SELECT ae.type, ae.created_at, ae.payload, u.name as actor_name
      FROM activity_events ae
      JOIN users u ON u.id = ae.actor_id
      WHERE ae.workspace_id = ${workspaceId}
        AND ae.entity_id = ${taskId}
      ORDER BY ae.created_at ASC
      LIMIT 50
    `;

    const context = {
      task: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
      },
      comments: comments.map((c: Record<string, unknown>) => ({
        author: c.author_name,
        body: c.body,
        at: c.created_at,
      })),
      activity: activity.map((a: Record<string, unknown>) => ({
        type: a.type,
        actor: a.actor_name,
        at: a.created_at,
        payload: a.payload,
      })),
    };

    const prompt = `You are summarizing a task for a teammate. Using only the JSON context below, write a concise status summary in 2-3 complete sentences. Mention current status, blockers or progress from comments/activity if relevant. Do not use bullet points. Plain text only.

Context:
${JSON.stringify(context, null, 2)}`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();
    if (!summary)
      return NextResponse.json(
        { error: "Empty summary from AI" },
        { status: 502 },
      );

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[POST /api/ai/summarize-task]", err);
    return NextResponse.json(
      { error: "Failed to summarize task" },
      { status: 500 },
    );
  }
}
