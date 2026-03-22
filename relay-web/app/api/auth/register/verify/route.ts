import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import {
  validateSignupEmail,
  validateVerificationCode,
} from "@/lib/validation/signup";

const MAX_ATTEMPTS = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const emailRaw = typeof body.email === "string" ? body.email : "";
    const codeRaw = typeof body.code === "string" ? body.code : "";

    const emailV = validateSignupEmail(emailRaw);
    if (!emailV.ok) {
      return NextResponse.json({ error: emailV.error }, { status: 400 });
    }

    const codeV = validateVerificationCode(codeRaw);
    if (!codeV.ok) {
      return NextResponse.json({ error: codeV.error }, { status: 400 });
    }

    const emailNormalized = emailV.value;
    const code = codeV.value;

    const rows = await sql`
      SELECT * FROM signup_verifications
      WHERE email_normalized = ${emailNormalized}
    `;

    if (!rows.length) {
      return NextResponse.json(
        { error: "No pending signup for this email. Start over from the form." },
        { status: 404 },
      );
    }

    const row = rows[0] as {
      code_hash: string;
      expires_at: string;
      attempt_count: number;
      name: string;
      password_hash: string;
    };

    if (new Date(row.expires_at).getTime() < Date.now()) {
      await sql`
        DELETE FROM signup_verifications WHERE email_normalized = ${emailNormalized}
      `;
      return NextResponse.json(
        { error: "Code expired. Go back and request a new one." },
        { status: 400 },
      );
    }

    if (row.attempt_count >= MAX_ATTEMPTS) {
      await sql`
        DELETE FROM signup_verifications WHERE email_normalized = ${emailNormalized}
      `;
      return NextResponse.json(
        { error: "Too many incorrect attempts. Start signup again." },
        { status: 403 },
      );
    }

    const match = await bcrypt.compare(code, row.code_hash);
    if (!match) {
      await sql`
        UPDATE signup_verifications
        SET attempt_count = attempt_count + 1
        WHERE email_normalized = ${emailNormalized}
      `;
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const dup = await sql`
      SELECT id FROM users WHERE lower(trim(email)) = ${emailNormalized}
    `;
    if (dup.length) {
      await sql`
        DELETE FROM signup_verifications WHERE email_normalized = ${emailNormalized}
      `;
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const inserted = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${row.name}, ${emailNormalized}, ${row.password_hash})
      RETURNING id, name, email
    `;

    await sql`
      DELETE FROM signup_verifications WHERE email_normalized = ${emailNormalized}
    `;

    return NextResponse.json({ ok: true, user: inserted[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/auth/register/verify]", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("signup_verifications") || msg.includes("does not exist")) {
      return NextResponse.json(
        {
          error:
            "Database migration required: run migrations/004_signup_verifications.sql",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
