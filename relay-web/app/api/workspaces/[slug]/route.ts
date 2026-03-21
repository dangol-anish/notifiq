import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId, getUserWorkspaceRole } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;

    const rows = await sql`
      SELECT w.*, wm.role
      FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.slug = ${slug} AND wm.user_id = ${userId}
    `;

    if (!rows.length)
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );

    const members = await sql`
      SELECT u.id, u.name, u.email, u.image, wm.role
      FROM workspace_members wm
      JOIN users u ON u.id = wm.user_id
      WHERE wm.workspace_id = ${rows[0].id}
    `;

    return NextResponse.json({ workspace: rows[0], members });
  } catch (err) {
    console.error("[GET /api/workspaces/:slug]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const role = await getUserWorkspaceRole(userId, slug);

    if (!role || !["owner", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Only owners and admins can rename workspaces" },
        { status: 403 },
      );
    }

    const { name } = await req.json();
    if (!name)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const rows = await sql`
      UPDATE workspaces SET name = ${name}
      WHERE slug = ${slug}
      RETURNING *
    `;

    return NextResponse.json({ workspace: rows[0] });
  } catch (err) {
    console.error("[PATCH /api/workspaces/:slug]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const role = await getUserWorkspaceRole(userId, slug);

    if (role !== "owner") {
      return NextResponse.json(
        { error: "Only the owner can delete a workspace" },
        { status: 403 },
      );
    }

    await sql`DELETE FROM workspaces WHERE slug = ${slug}`;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/workspaces/:slug]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
