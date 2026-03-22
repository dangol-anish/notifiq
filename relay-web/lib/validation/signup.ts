const EMAIL_MAX = 254;
const NAME_MIN = 2;
const NAME_MAX = 100;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

/** Loose RFC 5322–style check; normalize with trim + lowercase for storage. */
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function normalizeSignupEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateSignupName(name: string): { ok: true; value: string } | { ok: false; error: string } {
  const v = name.trim();
  if (v.length < NAME_MIN) {
    return { ok: false, error: `Name must be at least ${NAME_MIN} characters` };
  }
  if (v.length > NAME_MAX) {
    return { ok: false, error: `Name must be at most ${NAME_MAX} characters` };
  }
  return { ok: true, value: v };
}

export function validateSignupEmail(email: string): { ok: true; value: string } | { ok: false; error: string } {
  const v = email.trim();
  if (!v) return { ok: false, error: "Email is required" };
  if (v.length > EMAIL_MAX) return { ok: false, error: "Email is too long" };
  const norm = v.toLowerCase();
  if (!EMAIL_RE.test(norm)) return { ok: false, error: "Enter a valid email address" };
  return { ok: true, value: norm };
}

export function validateSignupPassword(password: string): { ok: true } | { ok: false; error: string } {
  if (typeof password !== "string") {
    return { ok: false, error: "Password is required" };
  }
  if (password.length < PASSWORD_MIN) {
    return { ok: false, error: `Password must be at least ${PASSWORD_MIN} characters` };
  }
  if (password.length > PASSWORD_MAX) {
    return { ok: false, error: `Password must be at most ${PASSWORD_MAX} characters` };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { ok: false, error: "Password must include at least one letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { ok: false, error: "Password must include at least one number" };
  }
  return { ok: true };
}

export function validateVerificationCode(code: string): { ok: true; value: string } | { ok: false; error: string } {
  const digits = String(code ?? "").replace(/\D/g, "");
  if (digits.length !== 6) {
    return { ok: false, error: "Enter the 6-digit code from your email" };
  }
  return { ok: true, value: digits };
}
