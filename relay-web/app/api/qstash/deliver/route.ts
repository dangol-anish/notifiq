import { NextRequest, NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { sql } from '@/lib/db'
import { publishPush } from '@/lib/redis'

async function handler(req: NextRequest) {
  try {
    const body = await req.json()
    const { notificationIds, recipientIds, type, title, body: msgBody, payload } = body

    if (!notificationIds?.length || !recipientIds?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Mark all notifications as delivered in DB
    await sql`
      UPDATE notifications
      SET delivered = true
      WHERE id = ANY(${notificationIds}::uuid[])
    `

    // Push to each recipient via Redis
    for (let i = 0; i < recipientIds.length; i++) {
      const userId = recipientIds[i]

      // Fetch the full notification row to send to the client
      const rows = await sql`
        SELECT * FROM notifications
        WHERE id = ${notificationIds[i]}
      `

      if (rows.length) {
        await publishPush(userId, rows[0])
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[POST /api/qstash/deliver]', err)
    // Return 500 so QStash retries
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Wrap with QStash signature verification
export const POST = verifySignatureAppRouter(handler)