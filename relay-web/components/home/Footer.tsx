import Link from "next/link";
import LogoMark from "@/components/brand/LogoMark";

export default function Footer() {
  return (
    <footer className="border-t border-outline-variant/20 bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-8 py-14 md:grid-cols-12">
        <div className="md:col-span-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary"
          >
            <LogoMark className="h-6 w-6" />
            <span className="font-serif text-lg font-bold italic">Notifiq</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-secondary">
            Real-time notifications and task updates, organized by workspace.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
            Account
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                href="/login"
                className="text-secondary transition-colors hover:text-primary"
              >
                Sign in
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="text-secondary transition-colors hover:text-primary"
              >
                Create account
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
            Product
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                href="/dashboard"
                className="text-secondary transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-outline-variant/15 px-8 py-8 text-xs text-secondary">
        © 2026 Notifiq
      </div>
    </footer>
  );
}
