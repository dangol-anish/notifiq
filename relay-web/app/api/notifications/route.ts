import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // Temporary: hardcode a test userId until NextAuth is set up
    // Replace this with: const userId = await getCurrentUserId()
    const userId = await getCurrentUserId()
    console.log('[notifications] userId:', userId)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const unseen = searchParams.get('unseen') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)
    const before = searchParams.get('before')

    const rows = unseen
      ? await sql`
          SELECT * FROM notifications
          WHERE user_id = ${userId} AND read = false
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      : before
      ? await sql`
          SELECT * FROM notifications
          WHERE user_id = ${userId} AND created_at < ${before}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT * FROM notifications
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `

    const countResult = await sql`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ${userId} AND read = false
    `

    return NextResponse.json({
      notifications: rows,
      unreadCount: Number(countResult[0].count),
      hasMore: rows.length === limit,
    })
  } catch (err) {
    console.error('[GET /api/notifications]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}