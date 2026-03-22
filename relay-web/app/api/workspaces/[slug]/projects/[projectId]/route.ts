import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId, getUserWorkspaceRole } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; projectId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug, projectId } = await params;
    const role = await getUserWorkspaceRole(userId, slug);

    if (!role || !["owner", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Only owners and admins can edit projects" },
        { status: 403 },
      );
    }

    const { name, description, status } = await req.json();

    if (
      status !== undefined &&
      status !== null &&
      !["active", "archived"].includes(status)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const rows = await sql`
      UPDATE projects SET
        name = COALESCE(${name ?? null}, name),
        description = COALESCE(${description ?? null}, description),
        status = COALESCE(${status ?? null}, status)
      WHERE id = ${projectId}
      RETURNING *
    `;

    if (!rows.length)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json({ project: rows[0] });
  } catch (err) {
    console.error("[PATCH /api/workspaces/:slug/projects/:projectId]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; projectId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug, projectId } = await params;
    const role = await getUserWorkspaceRole(userId, slug);

    if (!role || !["owner", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Only owners and admins can delete projects" },
        { status: 403 },
      );
    }

    await sql`DELETE FROM projects WHERE id = ${projectId}`;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/workspaces/:slug/projects/:projectId]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
