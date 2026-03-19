import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    const { email } = await req.json()

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    // Get workspace and verify user is a member
    const workspaceRows = await sql`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.slug = ${slug} AND wm.user_id = ${userId}
      AND wm.role IN ('owner', 'admin')
    `

    if (!workspaceRows.length) {
      return NextResponse.json({ error: 'Workspace not found or unauthorized' }, { status: 404 })
    }

    const workspace = workspaceRows[0]

    // Check if user is already a member
    const existingMember = await sql`
      SELECT wm.id FROM workspace_members wm
      JOIN users u ON u.id = wm.user_id
      WHERE wm.workspace_id = ${workspace.id} AND u.email = ${email}
    `

    if (existingMember.length) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 409 })
    }

    // Generate unique invite token
    const token = crypto.randomBytes(32).toString('hex')

    await sql`
      INSERT INTO workspace_invites (workspace_id, email, token, invited_by)
      VALUES (${workspace.id}, ${email}, ${token}, ${userId})
      ON CONFLICT DO NOTHING
    `

    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`

    // TODO: send email via Resend
    // For now return the invite URL directly
    console.log(`[invite] invite URL for ${email}: ${inviteUrl}`)

    return NextResponse.json({ ok: true, inviteUrl })
  } catch (err) {
    console.error('[POST /api/workspaces/:slug/invite]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}