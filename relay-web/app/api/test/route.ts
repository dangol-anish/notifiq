import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const rows = await sql`SELECT * FROM notifications LIMIT 1`
  return NextResponse.json({ ok: true, rows })
}