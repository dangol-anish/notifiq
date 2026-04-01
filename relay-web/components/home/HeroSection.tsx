import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface-container-low">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-8 py-18 lg:grid-cols-2">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 font-label text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">
            <span className="h-1 w-1 rounded-full bg-tertiary" />
            Real-time updates
          </p>

          <h1 className="mt-6 text-5xl font-headline font-bold tracking-tight text-primary sm:text-6xl">
            Everything your team needs to stay in sync.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-secondary">
            Notifiq keeps your team current with clean task flows and instant
            delivery—without extra UI noise.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="rounded-sm bg-primary px-7 py-3.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-95 active:opacity-90"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-sm border border-outline-variant/70 bg-surface-container-lowest px-7 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-surface-container"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 border-t border-outline-variant/20 pt-8">
            <Stat label="Delivery" value="Instant" />
            <Stat label="Read state" value="Tracked" />
            <Stat label="Digest" value="Weekly" />
          </div>
        </div>

        <div className="relative">
          <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-3 shadow-sm">
            <div className="overflow-hidden rounded-sm border border-outline-variant/10">
              <Image
                src="/1.png"
                alt="Notifiq dashboard preview"
                height={1000}
                width={1000}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-10 -z-10 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 -z-10 h-72 w-72 rounded-full bg-tertiary/10 blur-3xl" />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 font-headline text-lg font-bold text-primary">
        {value}
      </p>
    </div>
  );
}
