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
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

    const workspaceRows = await sql`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.slug = ${slug} AND wm.user_id = ${userId}
    `;

    if (!workspaceRows.length) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    const events = await sql`
      SELECT ae.*, u.name as actor_name, u.image as actor_image
      FROM activity_events ae
      JOIN users u ON u.id = ae.actor_id
      WHERE ae.workspace_id = ${workspaceRows[0].id}
      ORDER BY ae.created_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({ events });
  } catch (err) {
    console.error("[GET /api/workspaces/:slug/activity]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
