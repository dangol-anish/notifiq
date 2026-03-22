import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import crypto from "crypto";
import { getAppBaseUrl, sendWorkspaceInviteEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const { email: rawEmail } = await req.json();

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const workspaceRows = await sql`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.slug = ${slug} AND wm.user_id = ${userId}
      AND wm.role IN ('owner', 'admin')
    `;

    if (!workspaceRows.length) {
      return NextResponse.json(
        { error: "Workspace not found or unauthorized" },
        { status: 404 },
      );
    }

    const workspace = workspaceRows[0];

    const existingMember = await sql`
      SELECT wm.id FROM workspace_members wm
      JOIN users u ON u.id = wm.user_id
      WHERE wm.workspace_id = ${workspace.id} AND lower(u.email) = ${email}
    `;

    if (existingMember.length) {
      return NextResponse.json(
        { error: "User is already a member" },
        { status: 409 },
      );
    }

    const inviterRows = await sql`
      SELECT name FROM users WHERE id = ${userId}
    `;
    const inviterName = inviterRows[0]?.name ?? null;

    const pending = await sql`
      SELECT id, token, expires_at FROM workspace_invites
      WHERE workspace_id = ${workspace.id}
      AND lower(email) = ${email}
      AND accepted = false
      ORDER BY expires_at DESC
      LIMIT 1
    `;

    let token: string;

    if (pending.length) {
      const row = pending[0] as {
        id: string;
        token: string;
        expires_at: string | Date;
      };
      const expires =
        row.expires_at instanceof Date
          ? row.expires_at
          : new Date(row.expires_at);
      if (expires > new Date()) {
        token = row.token;
      } else {
        token = crypto.randomBytes(32).toString("hex");
        await sql`
          UPDATE workspace_invites
          SET token = ${token},
              invited_by = ${userId},
              expires_at = NOW() + interval '7 days'
          WHERE id = ${row.id}
        `;
      }
    } else {
      token = crypto.randomBytes(32).toString("hex");
      await sql`
        INSERT INTO workspace_invites (workspace_id, email, token, invited_by)
        VALUES (${workspace.id}, ${email}, ${token}, ${userId})
      `;
    }

    const inviteUrl = `${getAppBaseUrl()}/invite/${token}`;

    const sendResult = await sendWorkspaceInviteEmail({
      to: email,
      workspaceName: workspace.name as string,
      inviteUrl,
      inviterName,
    });

    const emailSent = sendResult.ok;
    const emailError = sendResult.ok ? undefined : sendResult.error;

    if (!sendResult.ok) {
      console.warn("[invite] Email not sent:", sendResult.error);
    }

    return NextResponse.json({
      ok: true,
      inviteUrl,
      emailSent,
      emailError,
    });
  } catch (err) {
    console.error("[POST /api/workspaces/:slug/invite]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
