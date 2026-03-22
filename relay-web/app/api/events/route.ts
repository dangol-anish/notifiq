import { NextRequest, NextResponse } from "next/server";
import { CreateEventInput } from "@/types/notification";
import { dispatchNotificationEvent } from "@/lib/dispatch-notification-event";

export async function POST(req: NextRequest) {
  try {
    const body: CreateEventInput = await req.json();
    const { type, senderId, recipientIds, title } = body;

    if (!type || !senderId || !recipientIds?.length || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const notificationIds = await dispatchNotificationEvent(body);
    return NextResponse.json({ ok: true, notificationIds }, { status: 202 });
  } catch (err) {
    console.error("[POST /api/events]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}