import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { publishPush } from '@/lib/redis'
import { CreateEventInput } from '@/types/notification'

export async function POST(req: NextRequest) {
  try {
    const body: CreateEventInput = await req.json()
    const { type, senderId, recipientIds, title, body: msgBody, payload } = body

    if (!type || !senderId || !recipientIds?.length || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const inserted = await Promise.all(
      recipientIds.map((userId) =>
        sql`
          INSERT INTO notifications (user_id, type, title, body, payload)
          VALUES (${userId}, ${type}, ${title}, ${msgBody ?? null}, ${JSON.stringify(payload ?? {})})
          RETURNING *
        `
      )
    )

    // Publish directly to Redis for local dev (bypasses QStash)
    // QStash will be used in production via /api/qstash/deliver
    for (let i = 0; i < recipientIds.length; i++) {
      const userId = recipientIds[i]
      const notification = inserted[i][0]
      await publishPush(userId, notification)
    }

    const notificationIds = inserted.map((rows) => rows[0].id)
    return NextResponse.json({ ok: true, notificationIds }, { status: 202 })
  } catch (err) {
    console.error('[POST /api/events]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}