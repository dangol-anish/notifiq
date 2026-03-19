import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { publishRead } from '@/lib/redis'
import { getCurrentUserId } from '@/lib/auth'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rows = await sql`
      UPDATE notifications
      SET read = true, read_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `

    if (!rows.length) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    await publishRead(userId, id)

    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[PATCH /api/notifications/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}