"use client";

import Link from "next/link";
import LogoMark from "@/components/brand/LogoMark";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary"
          >
            <LogoMark className="h-7 w-7" />
            <span className="text-xl font-serif font-bold italic">Notifiq</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-opacity active:opacity-80"
          >
            Get started free
          </Link>
        </div>
      </nav>
    </header>
  );
}
