import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { publishRead } from '@/lib/redis'
import { getCurrentUserId } from '@/lib/auth'

export async function PATCH(_req: NextRequest) {
  try {
    // Temporary: hardcoded until NextAuth is set up
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await sql`
      UPDATE notifications
      SET read = true, read_at = NOW()
      WHERE user_id = ${userId} AND read = false
      RETURNING id
    `

    await publishRead(userId, undefined, 'read-all')

    return NextResponse.json({ updated: result.length })
  } catch (err) {
    console.error('[PATCH /api/notifications/read-all]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}