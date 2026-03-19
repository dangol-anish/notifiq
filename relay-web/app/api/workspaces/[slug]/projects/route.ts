import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params

    const workspace = await sql`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.slug = ${slug} AND wm.user_id = ${userId}
    `

    if (!workspace.length) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const projects = await sql`
      SELECT * FROM projects
      WHERE workspace_id = ${workspace[0].id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ projects })
  } catch (err) {
    console.error('[GET /api/workspaces/:slug/projects]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    const { name, description } = await req.json()

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const workspace = await sql`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.slug = ${slug} AND wm.user_id = ${userId}
    `

    if (!workspace.length) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const rows = await sql`
      INSERT INTO projects (workspace_id, name, description, created_by)
      VALUES (${workspace[0].id}, ${name}, ${description ?? null}, ${userId})
      RETURNING *
    `

    return NextResponse.json({ project: rows[0] }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/workspaces/:slug/projects]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}