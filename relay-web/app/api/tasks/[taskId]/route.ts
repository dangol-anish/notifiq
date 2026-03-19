import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { taskId } = await params
    const { status, priority, assigneeId, title, description, dueDate } = await req.json()

    const rows = await sql`
      UPDATE tasks SET
        status = COALESCE(${status ?? null}, status),
        priority = COALESCE(${priority ?? null}, priority),
        assignee_id = COALESCE(${assigneeId ?? null}, assignee_id),
        title = COALESCE(${title ?? null}, title),
        description = COALESCE(${description ?? null}, description),
        due_date = COALESCE(${dueDate ?? null}, due_date),
        updated_at = NOW()
      WHERE id = ${taskId}
      RETURNING *
    `

    if (!rows.length) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    return NextResponse.json({ task: rows[0] })
  } catch (err) {
    console.error('[PATCH /api/tasks/:taskId]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { taskId } = await params

    await sql`DELETE FROM tasks WHERE id = ${taskId}`

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/tasks/:taskId]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}