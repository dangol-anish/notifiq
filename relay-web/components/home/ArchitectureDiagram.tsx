const stats = [
  { label: "Latency", value: "<20ms" },
  { label: "Uptime", value: "99.99%" },
  { label: "Security", value: "E2E" },
];

export default function ArchitectureDiagram() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-4xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-headline font-bold text-primary mb-4">
            The Foundation
          </h2>
          <p className="text-secondary">
            A minimal, robust infrastructure designed for zero-latency
            collaboration.
          </p>
        </div>

        <div className="relative p-12 bg-surface-container-low rounded-xl border border-outline-variant/10">
          <div className="flex flex-col items-center gap-12">
            {/* Diagram row */}
            <div className="w-full flex justify-between items-center px-12">
              <div className="bg-surface-container-lowest p-4 rounded-sm shadow-sm border border-outline-variant/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  desktop_windows
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Clients
                </span>
              </div>

              <div className="flex-1 h-px bg-outline-variant mx-4 border-dashed border-t" />

              <div className="bg-primary p-6 rounded-sm shadow-lg text-white text-center">
                <span className="material-symbols-outlined mb-2 block">
                  dns
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Edge Sync Engine
                </span>
              </div>

              <div className="flex-1 h-px bg-outline-variant mx-4 border-dashed border-t" />

              <div className="bg-surface-container-lowest p-4 rounded-sm shadow-sm border border-outline-variant/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  database
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Global DB
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 w-full">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`text-center ${i === 1 ? "border-x border-outline-variant/20" : ""}`}
                >
                  <p className="text-[10px] font-bold text-tertiary uppercase mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-headline font-bold text-primary">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
