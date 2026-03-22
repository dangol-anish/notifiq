import nodemailer from "nodemailer";
import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/** Public URL for links (invite, etc.) */
export function getAppBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

function inviteHtml(opts: {
  workspaceName: string;
  inviteUrl: string;
  inviterName: string;
}): string {
  return `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; line-height: 1.5; color: #111;">
        <p><strong>${escapeHtml(opts.inviterName)}</strong> invited you to join <strong>${escapeHtml(opts.workspaceName)}</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="${escapeHtml(opts.inviteUrl)}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600;">Accept invite</a>
        </p>
        <p style="font-size: 13px; color: #666;">Or paste this link into your browser:</p>
        <p style="font-size: 12px; color: #444; word-break: break-all;">${escapeHtml(opts.inviteUrl)}</p>
        <p style="font-size: 12px; color: #888; margin-top: 24px;">If you didn’t expect this, you can ignore this email.</p>
      </div>
    `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Send invite email. Provider order:
 * 1. SMTP (e.g. Gmail app password) — no third-party email “trial”; uses your mailbox.
 * 2. Resend — API key + optional verified domain for production `from`.
 */
export async function sendWorkspaceInviteEmail(opts: {
  to: string;
  workspaceName: string;
  inviteUrl: string;
  inviterName?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const inviter = opts.inviterName?.trim() || "A teammate";
  const subject = `You're invited to ${opts.workspaceName} on Notifiq`;
  const html = inviteHtml({
    workspaceName: opts.workspaceName,
    inviteUrl: opts.inviteUrl,
    inviterName: inviter,
  });

  const smtp = getSmtpConfig();
  if (smtp) {
    return sendWithSmtp({
      to: opts.to,
      subject,
      html,
      config: smtp,
    });
  }

  const resend = getResend();
  if (resend) {
    return sendWithResend({
      resend,
      to: opts.to,
      subject,
      html,
    });
  }

  return {
    ok: false,
    error:
      "No email provider: set SMTP_HOST + SMTP_USER + SMTP_PASS + EMAIL_FROM (see Gmail app password), or RESEND_API_KEY",
  };
}

function getSmtpConfig(): {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
} | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass =
    process.env.SMTP_PASS?.trim() || process.env.SMTP_PASSWORD?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!host || !user || !pass || !from) return null;

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure =
    process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";
  return { host, port, secure, user, pass, from };
}

async function sendWithSmtp(opts: {
  to: string;
  subject: string;
  html: string;
  config: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: opts.config.host,
      port: opts.config.port,
      secure: opts.config.secure,
      auth: {
        user: opts.config.user,
        pass: opts.config.pass,
      },
    });

    await transporter.sendMail({
      from: opts.config.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return { ok: true };
  } catch (err: unknown) {
    console.error("[email] SMTP error:", err);
    const msg = err instanceof Error ? err.message : "Failed to send email";
    return { ok: false, error: msg };
  }
}

async function sendWithResend(opts: {
  resend: Resend;
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const from =
    process.env.RESEND_FROM?.trim() ||
    "Notifiq <onboarding@resend.dev>";

  const { data, error } = await opts.resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) {
    console.error("[email] Resend error:", error);
    const msg =
      typeof error === "string"
        ? error
        : (error as { message?: string }).message ||
          "Failed to send email";
    return { ok: false, error: msg };
  }

  if (!data) {
    return { ok: false, error: "No response from email provider" };
  }

  return { ok: true };
}

function signupVerificationHtml(opts: { name: string; code: string }): string {
  const name = escapeHtml(opts.name);
  const code = escapeHtml(opts.code);
  return `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; line-height: 1.5; color: #111;">
        <p>Hi ${name},</p>
        <p>Use this code to finish creating your <strong>Notifiq</strong> account:</p>
        <p style="margin: 24px 0; font-size: 28px; font-weight: 700; letter-spacing: 0.2em; font-family: ui-monospace, monospace;">${code}</p>
        <p style="font-size: 14px; color: #666;">This code expires in <strong>15 minutes</strong>. If you didn’t sign up, you can ignore this email.</p>
      </div>
    `;
}

/** Send 6-digit signup verification code. */
export async function sendSignupVerificationEmail(opts: {
  to: string;
  name: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const subject = `${opts.code} is your Notifiq verification code`;
  const html = signupVerificationHtml({
    name: opts.name,
    code: opts.code,
  });

  const smtp = getSmtpConfig();
  if (smtp) {
    return sendWithSmtp({
      to: opts.to,
      subject,
      html,
      config: smtp,
    });
  }

  const resend = getResend();
  if (resend) {
    return sendWithResend({
      resend,
      to: opts.to,
      subject,
      html,
    });
  }

  return {
    ok: false,
    error:
      "No email provider: set SMTP_HOST + SMTP_USER + SMTP_PASS + EMAIL_FROM, or RESEND_API_KEY",
  };
}
