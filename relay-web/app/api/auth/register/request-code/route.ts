import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { sendSignupVerificationEmail } from "@/lib/email";
import {
  validateSignupEmail,
  validateSignupName,
  validateSignupPassword,
} from "@/lib/validation/signup";

const COOLDOWN_MS = 60_000;
const CODE_EXPIRY_MIN = 15;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nameRaw = typeof body.name === "string" ? body.name : "";
    const emailRaw = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    const nameV = validateSignupName(nameRaw);
    if (!nameV.ok) {
      return NextResponse.json({ error: nameV.error }, { status: 400 });
    }

    const emailV = validateSignupEmail(emailRaw);
    if (!emailV.ok) {
      return NextResponse.json({ error: emailV.error }, { status: 400 });
    }

    const passV = validateSignupPassword(password);
    if (!passV.ok) {
      return NextResponse.json({ error: passV.error }, { status: 400 });
    }

    const emailNormalized = emailV.value;

    const existingUser = await sql`
      SELECT id FROM users WHERE lower(trim(email)) = ${emailNormalized}
    `;
    if (existingUser.length) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const pending = await sql`
      SELECT last_sent_at FROM signup_verifications
      WHERE email_normalized = ${emailNormalized}
    `;

    if (pending.length) {
      const last = new Date(pending[0].last_sent_at as string).getTime();
      const elapsed = Date.now() - last;
      if (elapsed < COOLDOWN_MS) {
        const retryAfterSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            error: `Please wait ${retryAfterSeconds}s before requesting another code`,
            retryAfterSeconds,
          },
          { status: 429 },
        );
      }
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const codeHash = await bcrypt.hash(code, 8);
    const passwordHash = await bcrypt.hash(password, 12);
    const expiresAt = new Date(
      Date.now() + CODE_EXPIRY_MIN * 60_000,
    ).toISOString();

    const sent = await sendSignupVerificationEmail({
      to: emailNormalized,
      name: nameV.value,
      code,
    });

    if (!sent.ok) {
      console.error("[request-code] email failed:", sent.error);
      return NextResponse.json(
        {
          error:
            "Could not send verification email. Check email provider settings.",
          detail: sent.error,
        },
        { status: 502 },
      );
    }

    await sql`
      INSERT INTO signup_verifications (
        email_normalized,
        name,
        password_hash,
        code_hash,
        expires_at,
        last_sent_at,
        attempt_count
      )
      VALUES (
        ${emailNormalized},
        ${nameV.value},
        ${passwordHash},
        ${codeHash},
        ${expiresAt},
        NOW(),
        0
      )
      ON CONFLICT (email_normalized) DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        code_hash = EXCLUDED.code_hash,
        expires_at = EXCLUDED.expires_at,
        last_sent_at = NOW(),
        attempt_count = 0
    `;

    return NextResponse.json({
      ok: true,
      email: emailNormalized,
      expiresInMinutes: CODE_EXPIRY_MIN,
    });
  } catch (err) {
    console.error("[POST /api/auth/register/request-code]", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("signup_verifications") || msg.includes("does not exist")) {
      return NextResponse.json(
        {
          error:
            "Database migration required: run migrations/004_signup_verifications.sql on your Neon database",
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
