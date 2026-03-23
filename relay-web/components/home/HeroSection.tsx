import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-20 pb-24 px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div className="max-w-xl">
          <span className="inline-block text-tertiary font-label text-xs tracking-widest uppercase mb-4">
            The New Standard of Sync
          </span>
          <h1 className="text-6xl md:text-7xl font-headline font-bold text-black tracking-tighter mb-6">
            Your team,
          </h1>
          <h1 className="text-6xl md:text-7xl font-serif font-normal text-green-700 tracking-tighter mb-6 italic">
            always in sync.
          </h1>
          <p className="text-xl imatext-secondary leading-relaxed mb-10">
            Notifiq orchestrates your complex workflows into a single,
            architectural timeline. Real-time collaboration built for teams that
            demand precision and clarity.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/register"
              className="bg-primary text-on-primary px-8 py-4 text-base font-semibold rounded-sm hover:opacity-90 transition-all"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="border border-outline-variant text-primary px-8 py-4 text-base font-semibold rounded-sm hover:bg-surface-container transition-all"
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* Mockup */}
        <div className="relative">
          <div className="">
            <Image src="/1.png" alt="Mockup" height={1000} width={1000} />
          </div>

          {/* Accent blur */}
          <div className="absolute -z-10 -bottom-8 -right-8 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
}
