"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  slug: string;
}

/** Resend blocks non-account recipients when using the default test `from` address. */
function isResendTestSenderRestriction(message: string | null): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("verify a domain") ||
    m.includes("testing emails") ||
    m.includes("own email address")
  );
}

export default function InviteMemberModal({ slug }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInviteUrl("");
    setEmailSent(null);
    setEmailError(null);

    const res = await fetch(`/api/workspaces/${slug}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setInviteUrl(data.inviteUrl);
    setEmailSent(data.emailSent ?? false);
    setEmailError(data.emailError ?? null);
    if (data.emailSent) {
      toast.success("Invite email sent");
    } else if (data.emailError) {
      toast.error(
        isResendTestSenderRestriction(data.emailError)
          ? "Invite saved — verify a Resend domain to email anyone, or copy the link"
          : "Invite saved; email not sent — copy the link below",
      );
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Invite Member
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Invite Member
            </h2>

            {!inviteUrl ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="teammate@example.com"
                    required
                    autoFocus
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send invite"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {emailSent ? (
                  <p className="text-sm text-gray-600">
                    We sent an invite to <strong>{email}</strong>. They can also
                    use the link below if needed.
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    {emailError ? (
                      <span className="block">
                        {isResendTestSenderRestriction(emailError) ? (
                          <span className="text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-3 text-xs block mb-3 space-y-2">
                            <p className="font-medium text-amber-950">
                              Resend’s test sender only delivers to your own
                              inbox. To email <strong>{email}</strong> (or anyone
                              else), verify a domain and set{" "}
                              <code className="font-mono bg-amber-100/80 px-1 rounded">
                                RESEND_FROM
                              </code>
                              .
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-amber-900">
                              <li>
                                Add & verify a domain at{" "}
                                <a
                                  href="https://resend.com/domains"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium underline"
                                >
                                  resend.com/domains
                                </a>
                              </li>
                              <li>
                                Set{" "}
                                <code className="font-mono bg-amber-100/80 px-1 rounded">
                                  RESEND_FROM
                                </code>{" "}
                                to something like{" "}
                                <code className="font-mono bg-amber-100/80 px-1 rounded">
                                  Notifiq &lt;invite@yourdomain.com&gt;
                                </code>
                              </li>
                            </ol>
                            <p className="text-amber-800 pt-1">
                              Until then, share the link below manually.
                            </p>
                          </span>
                        ) : /SMTP_|EMAIL_FROM|RESEND_API_KEY|No email provider/i.test(
                            emailError,
                          ) ? (
                          <span className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs block mb-3">
                            Email could not be sent: {emailError}. Fix your env
                            vars or share the link below.
                          </span>
                        ) : (
                          <span className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs block mb-3">
                            Email could not be sent: {emailError}. Share the link
                            below manually.
                          </span>
                        )}
                        Share this link with <strong>{email}</strong>:
                      </span>
                    ) : (
                      <>
                        Share this link with <strong>{email}</strong>:
                      </>
                    )}
                  </p>
                )}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 break-all">
                  <p className="text-xs text-gray-700 font-mono">{inviteUrl}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteUrl);
                  }}
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Copy link
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setInviteUrl("");
                    setEmail("");
                    setEmailSent(null);
                    setEmailError(null);
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
