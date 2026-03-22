import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const workspace = await sql`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.slug = ${slug} AND wm.user_id = ${userId}
    `;

    if (!workspace.length)
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );

    const results = await sql`
      SELECT
        t.id,
        t.title,
        t.status,
        t.priority,
        p.id as project_id,
        p.name as project_name
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      WHERE t.workspace_id = ${workspace[0].id}
      AND (
        t.title ILIKE ${"%" + query + "%"}
        OR t.description ILIKE ${"%" + query + "%"}
      )
      ORDER BY t.created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[GET /api/workspaces/:slug/search]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
