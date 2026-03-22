"use client";

import Link from "next/link";

const navLinks = [
  { label: "Features", href: "#", active: true },
  { label: "How it works", href: "#" },
  { label: "Stack", href: "#" },
  { label: "Pricing", href: "#" },
];

export default function Navbar() {
  return (
    <header className="bg-white/80 dark:bg-emerald-950/80 backdrop-blur-md sticky top-0 w-full z-50 shadow-sm">
      <nav className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold font-serif text-emerald-900 dark:text-emerald-50"
          >
            Notifiq
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            {/* {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={
                  link.active
                    ? "text-emerald-900 dark:text-white border-b-2 border-emerald-900 dark:border-emerald-50 pb-1 text-sm font-medium transition-colors"
                    : "text-emerald-800/70 dark:text-emerald-200/70 text-sm font-medium hover:text-emerald-900 dark:hover:text-emerald-50 transition-colors"
                }
              >
                {link.label}
              </Link>
            ))} */}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-emerald-800/70 hover:text-emerald-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-primary text-on-primary px-5 py-2.5 text-sm font-medium rounded-sm scale-95 duration-200 active:opacity-80"
          >
            Get started free
          </Link>
        </div>
      </nav>
    </header>
  );
}
