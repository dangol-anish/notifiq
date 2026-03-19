import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; projectId: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug, projectId } = await params

    const workspace = await sql`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.slug = ${slug} AND wm.user_id = ${userId}
    `

    if (!workspace.length) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const tasks = await sql`
      SELECT t.*, u.name as assignee_name, u.image as assignee_image
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assignee_id
      WHERE t.project_id = ${projectId}
      ORDER BY t.created_at DESC
    `

    return NextResponse.json({ tasks })
  } catch (err) {
    console.error('[GET /api/workspaces/:slug/projects/:projectId/tasks]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; projectId: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug, projectId } = await params
    const { title, description, priority, assigneeId, dueDate } = await req.json()

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const workspace = await sql`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.slug = ${slug} AND wm.user_id = ${userId}
    `

    if (!workspace.length) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const rows = await sql`
      INSERT INTO tasks (project_id, workspace_id, title, description, priority, assignee_id, due_date, created_by)
      VALUES (
        ${projectId},
        ${workspace[0].id},
        ${title},
        ${description ?? null},
        ${priority ?? 'medium'},
        ${assigneeId ?? null},
        ${dueDate ?? null},
        ${userId}
      )
      RETURNING *
    `

    const task = rows[0]

    // Fire notification if task is assigned
    if (assigneeId && assigneeId !== userId) {
      await fetch(`${process.env.NEXTAUTH_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'task_assigned',
          senderId: userId,
          recipientIds: [assigneeId],
          title: 'You were assigned a task',
          body: `${title}`,
          payload: { taskId: task.id, projectId, workspaceSlug: slug },
        }),
      })
    }

    return NextResponse.json({ task }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/workspaces/:slug/projects/:projectId/tasks]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}