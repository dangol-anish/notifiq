import { NextRequest, NextResponse } from "next/server";
import { SchemaType, type Schema } from "@google/generative-ai";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getGeminiFlashModel } from "@/lib/gemini";
import { publishTaskUpdated } from "@/lib/redis";
import { logActivity } from "@/lib/activity";
import { assertProjectNotArchivedByProjectId } from "@/lib/project-archive";

const PRIORITIES = new Set(["low", "medium", "high", "urgent"]);

const taskItemSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
    priority: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["low", "medium", "high", "urgent"],
    },
    due_days: { type: SchemaType.INTEGER },
  },
  required: ["title", "description", "priority", "due_days"],
};

const tasksResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    tasks: {
      type: SchemaType.ARRAY,
      items: taskItemSchema,
      minItems: 5,
      maxItems: 10,
    },
  },
  required: ["tasks"],
};

function addDueDays(dueDays: number): string {
  const d = new Date();
  const n = Math.max(0, Math.min(365, Math.round(Number(dueDays)) || 0));
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

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

    const body = await req.json();
    const goal = typeof body.goal === "string" ? body.goal.trim() : "";
    const projectId = body.projectId as string | undefined;
    const workspaceSlug = body.workspaceSlug as string | undefined;

    if (!goal)
      return NextResponse.json({ error: "goal is required" }, { status: 400 });
    if (!projectId || !workspaceSlug)
      return NextResponse.json(
        { error: "projectId and workspaceSlug are required" },
        { status: 400 },
      );

    const workspace = await sql`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.slug = ${workspaceSlug} AND wm.user_id = ${userId}
    `;

    if (!workspace.length)
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );

    const archiveCheck = await assertProjectNotArchivedByProjectId(projectId);
    if (!archiveCheck.ok) {
      return NextResponse.json(
        { error: archiveCheck.message },
        { status: archiveCheck.status },
      );
    }

    const projectRows = await sql`
      SELECT id FROM projects
      WHERE id = ${projectId} AND workspace_id = ${workspace[0].id}
    `;
    if (!projectRows.length)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const prompt = `You are a project planning assistant. Break the following goal into 5 to 10 concrete, actionable tasks for a software team.
Each task needs a clear title, a short description (1-2 sentences), a priority (low, medium, high, or urgent), and due_days (integer days from today until the task should be due — use realistic spreads, e.g. 0–30).

Goal:
${goal}

Respond only with JSON matching the schema (no markdown).`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: tasksResponseSchema,
      },
    });

    const text = result.response.text();
    let parsed: { tasks: Array<Record<string, unknown>> };
    try {
      parsed = JSON.parse(text) as { tasks: Array<Record<string, unknown>> };
    } catch {
      return NextResponse.json(
        { error: "Invalid response from AI" },
        { status: 502 },
      );
    }

    if (!Array.isArray(parsed.tasks) || parsed.tasks.length < 5) {
      return NextResponse.json(
        { error: "AI returned too few tasks" },
        { status: 502 },
      );
    }

    const tasksToInsert = parsed.tasks.slice(0, 10);
    const inserted: unknown[] = [];

    for (const raw of tasksToInsert) {
      const title = String(raw.title ?? "").trim();
      if (!title) continue;
      const description =
        raw.description != null ? String(raw.description).trim() : null;
      let priority = String(raw.priority ?? "medium").toLowerCase();
      if (!PRIORITIES.has(priority)) priority = "medium";
      const dueDays = Number(raw.due_days);
      const dueDate = addDueDays(Number.isFinite(dueDays) ? dueDays : 7);

      const rows = await sql`
        INSERT INTO tasks (project_id, workspace_id, title, description, priority, assignee_id, due_date, created_by)
        VALUES (
          ${projectId},
          ${workspace[0].id},
          ${title},
          ${description || null},
          ${priority},
          ${null},
          ${dueDate},
          ${userId}
        )
        RETURNING *
      `;
      const task = rows[0];
      inserted.push(task);

      await publishTaskUpdated(workspace[0].id as string, task);
      await logActivity({
        workspaceId: workspace[0].id as string,
        actorId: userId,
        type: "task_created",
        entityType: "task",
        entityId: task.id as string,
        payload: { title: task.title, projectId },
      });
    }

    if (inserted.length === 0)
      return NextResponse.json(
        { error: "No valid tasks could be created" },
        { status: 502 },
      );

    return NextResponse.json({ tasks: inserted });
  } catch (err) {
    console.error("[POST /api/ai/generate-tasks]", err);
    return NextResponse.json(
      { error: "Failed to generate tasks" },
      { status: 500 },
    );
  }
}
