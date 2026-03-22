"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  validateSignupEmail,
  validateSignupName,
  validateSignupPassword,
  validateVerificationCode,
} from "@/lib/validation/signup";

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const show = local.slice(0, Math.min(2, local.length));
  return `${show}•••@${domain}`;
}

export default function RegisterPage() {
  const [step, setStep] = useState<"details" | "verify">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [normalizedEmail, setNormalizedEmail] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") return "/dashboard";
    return (
      new URLSearchParams(window.location.search).get("callbackUrl") ||
      "/dashboard"
    );
  }, []);

  const loginHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  function validateDetails(): boolean {
    const fe: Record<string, string> = {};
    const n = validateSignupName(name);
    if (!n.ok) fe.name = n.error;
    const e = validateSignupEmail(email);
    if (!e.ok) fe.email = e.error;
    const p = validateSignupPassword(password);
    if (!p.ok) fe.password = p.error;
    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  }

  async function sendVerificationCode() {
    setError("");
    if (!validateDetails()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send verification email");
        return;
      }
      setNormalizedEmail(String(data.email ?? ""));
      setStep("verify");
      setCode("");
      setFieldErrors({});
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const codeV = validateVerificationCode(code);
    if (!codeV.ok) {
      setError(codeV.error);
      return;
    }
    const emailCheck = validateSignupEmail(normalizedEmail || email);
    if (!emailCheck.ok) {
      setError("Go back and check your email address.");
      return;
    }
    const emailForVerify = emailCheck.value;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailForVerify, code: codeV.value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }
      const { signIn } = await import("next-auth/react");
      await signIn("credentials", {
        email: emailForVerify,
        password,
        callbackUrl,
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {step === "details" ? (
          <>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Create an account
            </h1>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              We&apos;ll email you a code to verify before your account is
              created.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendVerificationCode();
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="John Doe"
                  autoComplete="name"
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="8+ characters, letter and number"
                  autoComplete="new-password"
                  aria-invalid={!!fieldErrors.password}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  At least 8 characters, including one letter and one number.
                </p>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Sending code…" : "Continue — send verification code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Check your email
            </h1>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Enter the 6-digit code we sent to{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {maskEmail(normalizedEmail || email)}
              </span>
              . It expires in 15 minutes.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className={`${inputClass} font-mono text-lg tracking-widest`}
                  placeholder="000000"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify and create account"}
              </button>

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setStep("details");
                    setError("");
                    setCode("");
                  }}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  ← Edit details
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void sendVerificationCode()}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Resend code
                </button>
              </div>
            </form>
          </>
        )}

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
