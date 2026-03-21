import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId, getUserWorkspaceRole } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const { memberId } = await req.json();
    const role = await getUserWorkspaceRole(userId, slug);

    if (role !== "owner") {
      return NextResponse.json(
        { error: "Only the owner can remove members" },
        { status: 403 },
      );
    }

    // Prevent removing yourself
    if (memberId === userId) {
      return NextResponse.json(
        { error: "You cannot remove yourself" },
        { status: 400 },
      );
    }

    const workspace = await sql`
      SELECT id FROM workspaces WHERE slug = ${slug}
    `;

    await sql`
      DELETE FROM workspace_members
      WHERE workspace_id = ${workspace[0].id} AND user_id = ${memberId}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/workspaces/:slug/members]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
