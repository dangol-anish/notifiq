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
          <p className="text-xl text-secondary leading-relaxed mb-10">
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
          <div className="bg-surface-container-lowest p-4 rounded-lg shadow-2xl border border-outline-variant/20">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 mb-4 border-b border-surface-container pb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-error/20" />
                <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim/40" />
                <div className="w-3 h-3 rounded-full bg-primary-fixed-dim/40" />
              </div>
              <div className="bg-surface-container px-3 py-1 rounded-sm text-[10px] text-secondary font-medium mx-auto">
                notifiq.app/workspace/global-sync
              </div>
            </div>

            {/* Kanban columns */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">
                  Backlog
                </h4>
                <div className="bg-surface-container-low p-3 rounded-sm space-y-2">
                  <div className="h-2 w-3/4 bg-secondary/10 rounded-full" />
                  <div className="h-2 w-1/2 bg-secondary/10 rounded-full" />
                </div>
                <div className="bg-surface-container-low p-3 rounded-sm space-y-2">
                  <div className="h-2 w-full bg-secondary/10 rounded-full" />
                  <div className="h-2 w-2/3 bg-secondary/10 rounded-full" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">
                  In Progress
                </h4>
                <div className="bg-primary-container/10 p-3 rounded-sm space-y-2 border-l-2 border-primary">
                  <div className="h-2 w-full bg-primary/20 rounded-full" />
                  <div className="h-2 w-4/5 bg-primary/20 rounded-full" />
                  <div className="flex gap-1 pt-1">
                    <div className="w-4 h-4 rounded-full bg-secondary" />
                    <div className="w-4 h-4 rounded-full bg-tertiary" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">
                  Done
                </h4>
                <div className="bg-surface-container-low p-3 rounded-sm opacity-50 space-y-2">
                  <div className="h-2 w-5/6 bg-secondary/10 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Accent blur */}
          <div className="absolute -z-10 -bottom-8 -right-8 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
}
