import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;

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

    const labels = await sql`
      SELECT * FROM labels
      WHERE workspace_id = ${workspace[0].id}
      ORDER BY name ASC
    `;

    return NextResponse.json({ labels });
  } catch (err) {
    console.error("[GET /api/workspaces/:slug/labels]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const { name, color } = await req.json();

    if (!name)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

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

    const rows = await sql`
      INSERT INTO labels (workspace_id, name, color)
      VALUES (${workspace[0].id}, ${name}, ${color ?? "#6366f1"})
      RETURNING *
    `;

    return NextResponse.json({ label: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/workspaces/:slug/labels]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const { labelId } = await req.json();

    const workspace = await sql`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.slug = ${slug} AND wm.user_id = ${userId}
      AND wm.role IN ('owner', 'admin')
    `;

    if (!workspace.length)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await sql`
      DELETE FROM labels
      WHERE id = ${labelId} AND workspace_id = ${workspace[0].id}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/workspaces/:slug/labels]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
