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
    "w-full px-2 py-3 bg-surface-container-low border-b border-outline-variant/30 border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline-variant/60 text-on-surface text-sm outline-none";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex justify-between items-center w-full px-8 py-3">
        <div className="text-2xl font-serif italic text-primary">Notifiq</div>
        <div className="hidden md:flex gap-8 items-center">
          <Link
            href="/"
            className="text-secondary text-sm font-medium hover:text-primary transition-colors duration-300"
          >
            Back to home
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 bg-surface-container-low">
        <div className="w-full max-w-[480px] bg-surface-container-lowest p-8 md:p-12 shadow-sm border border-outline-variant/10">
          {step === "details" ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-8 text-center">
                <div className="text-lg font-serif italic text-primary mb-6">
                  Notifiq
                </div>
                <h1 className="text-3xl font-headline text-primary mb-2">
                  Create your account
                </h1>
                <p className="text-secondary text-sm font-body">
                  Join 4,000+ teams building the future on Notifiq.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendVerificationCode();
                }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <label
                    htmlFor="name"
                    className="block text-[11px] font-semibold text-secondary uppercase tracking-wider"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    aria-invalid={!!fieldErrors.name}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-error">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-semibold text-secondary uppercase tracking-wider"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="name@company.com"
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.email}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-error">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-semibold text-secondary uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="8+ characters, letter and number"
                    autoComplete="new-password"
                    aria-invalid={!!fieldErrors.password}
                  />
                  <p className="mt-1 text-xs text-secondary/60">
                    At least 8 characters, including one letter and one number.
                  </p>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-error">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {error && <p className="text-sm text-error">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-4 font-semibold text-sm tracking-wide hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
                >
                  {loading
                    ? "Sending code…"
                    : "Continue — send verification code"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-8 text-center">
                <div className="text-lg font-serif italic text-primary mb-6">
                  Notifiq
                </div>
                <h1 className="text-3xl font-headline text-primary mb-2">
                  Check your email
                </h1>
                <p className="text-secondary text-sm font-body px-2">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-semibold text-on-surface">
                    {maskEmail(normalizedEmail || email)}
                  </span>
                  . It expires in 15 minutes.
                </p>
              </div>

              {/* Verify form */}
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-1">
                  <label
                    htmlFor="code"
                    className="block text-[11px] font-semibold text-secondary uppercase tracking-wider"
                  >
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className={`${inputClass} font-mono text-lg tracking-[0.4em]`}
                    placeholder="000000"
                  />
                </div>

                {error && <p className="text-sm text-error">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-primary text-on-primary py-4 font-semibold text-sm tracking-wide hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? "Verifying…" : "Verify and create account"}
                </button>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setStep("details");
                      setError("");
                      setCode("");
                    }}
                    className="text-sm text-secondary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    ← Edit details
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void sendVerificationCode()}
                    className="text-sm text-primary font-semibold hover:underline disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Sign in link */}
          <div className="mt-8 pt-6 border-t border-outline-variant/10 text-center">
            <p className="text-sm text-secondary">
              Already have an account?{" "}
              <Link
                href={loginHref}
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Legal */}
          {/* <p className="mt-4 text-center text-[12px] text-secondary leading-relaxed px-4">
            By signing up, you agree to our{" "}
            <a href="#" className="underline text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline text-primary">
              Privacy Policy
            </a>
            .
          </p> */}
        </div>
      </main>
    </div>
  );
}
