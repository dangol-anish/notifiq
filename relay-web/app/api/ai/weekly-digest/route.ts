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

    const { workspaceSlug } = await req.json();
    if (!workspaceSlug || typeof workspaceSlug !== "string")
      return NextResponse.json(
        { error: "workspaceSlug is required" },
        { status: 400 },
      );

    const workspaceRows = await sql`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.slug = ${workspaceSlug} AND wm.user_id = ${userId}
    `;

    if (!workspaceRows.length)
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );

    const workspaceId = workspaceRows[0].id as string;

    const events = await sql`
      SELECT ae.type, ae.created_at, ae.payload, ae.entity_type, u.name as actor_name
      FROM activity_events ae
      JOIN users u ON u.id = ae.actor_id
      WHERE ae.workspace_id = ${workspaceId}
        AND ae.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY ae.created_at DESC
      LIMIT 120
    `;

    const statsRows = await sql`
      SELECT
        COUNT(*)::int AS total_tasks,
        COUNT(*) FILTER (WHERE t.status = 'done')::int AS done_tasks,
        COUNT(*) FILTER (WHERE t.status != 'done')::int AS open_tasks,
        COUNT(*) FILTER (WHERE t.created_at >= NOW() - INTERVAL '7 days')::int AS tasks_created_week,
        COUNT(*) FILTER (
          WHERE t.due_date IS NOT NULL
            AND t.due_date < CURRENT_DATE
            AND t.status != 'done'
        )::int AS overdue_tasks
      FROM tasks t
      WHERE t.workspace_id = ${workspaceId}
    `;

    const stats = statsRows[0] ?? {
      total_tasks: 0,
      done_tasks: 0,
      open_tasks: 0,
      tasks_created_week: 0,
      overdue_tasks: 0,
    };

    const digestInput = {
      workspace_name: workspaceRows[0].name,
      period: "last 7 days",
      task_stats: stats,
      recent_activity: events.map((e: Record<string, unknown>) => ({
        type: e.type,
        actor: e.actor_name,
        at: e.created_at,
        entity_type: e.entity_type,
        payload: e.payload,
      })),
    };

    const prompt = `You are writing a short weekly workspace digest for the team. Using only the JSON data below, write 3-4 sentences in plain text (no bullets, no markdown). Highlight meaningful progress, new work, and anything notable from activity. If activity is sparse, say so briefly and focus on task stats.

Data:
${JSON.stringify(digestInput, null, 2)}`;

    const result = await model.generateContent(prompt);
    const digest = result.response.text().trim();
    if (!digest)
      return NextResponse.json(
        { error: "Empty digest from AI" },
        { status: 502 },
      );

    return NextResponse.json({ digest });
  } catch (err) {
    console.error("[POST /api/ai/weekly-digest]", err);
    return NextResponse.json(
      { error: "Failed to generate digest" },
      { status: 500 },
    );
  }
}
