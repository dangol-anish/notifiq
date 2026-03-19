import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(_req: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const workspaces = await sql`
      SELECT w.*, wm.role
      FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE wm.user_id = ${userId}
      ORDER BY w.created_at DESC
    `

    return NextResponse.json({ workspaces })
  } catch (err) {
    console.error('[GET /api/workspaces]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6)

    // Create workspace
    const rows = await sql`
      INSERT INTO workspaces (name, slug, owner_id)
      VALUES (${name}, ${slug}, ${userId})
      RETURNING *
    `

    const workspace = rows[0]

    // Auto-add creator as owner member
    await sql`
      INSERT INTO workspace_members (workspace_id, user_id, role)
      VALUES (${workspace.id}, ${userId}, 'owner')
    `

    return NextResponse.json({ workspace }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/workspaces]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}