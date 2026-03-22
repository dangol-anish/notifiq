export default function AISpotlight() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-headline font-bold text-primary mb-4">
            Intelligence, not gimmicks.
          </h2>
          <p className="text-secondary max-w-2xl mx-auto">
            Our AI doesn&apos;t write for you. It organizes for you. Automate
            the mundane so you can focus on the architectural.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large card */}
          <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-sm shadow-sm border border-outline-variant/5">
            <div className="flex flex-col h-full justify-between">
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-6 block">
                  auto_awesome
                </span>
                <h3 className="text-2xl font-headline font-bold text-primary mb-4">
                  Semantic Task Routing
                </h3>
                <p className="text-secondary max-w-md">
                  Our engine understands the context of project discussions and
                  automatically routes tasks to the right specialist without
                  manual intervention.
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-surface-container">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">
                      psychology
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase">
                      Context Analysis
                    </p>
                    <p className="text-sm text-secondary">
                      Active monitoring of project health
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Small card – secondary */}
          <div className="bg-secondary p-8 rounded-sm text-white flex flex-col justify-between">
            <h3 className="text-xl font-headline font-bold">Smart Summary</h3>
            <p className="text-secondary-fixed opacity-90 text-sm leading-relaxed">
              Catch up on 400+ comments in a 30-second bulleted summary
              generated specifically for your role.
            </p>
            <button className="mt-6 text-sm font-bold flex items-center gap-2 group">
              Learn more{" "}
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Small card */}
          <div className="bg-surface-container p-8 rounded-sm flex flex-col justify-between">
            <span className="material-symbols-outlined text-tertiary text-3xl">
              analytics
            </span>
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">
                Predictive Timelines
              </h3>
              <p className="text-secondary text-sm">
                Automatically adjust deadlines based on historical team velocity
                and current bandwidth.
              </p>
            </div>
          </div>

          {/* Medium wide card */}
          <div className="md:col-span-2 bg-tertiary p-8 rounded-sm text-tertiary-fixed flex items-center justify-between">
            <div className="max-w-xs">
              <h3 className="text-2xl font-headline font-bold mb-2">
                Architectural Integrity
              </h3>
              <p className="text-tertiary-fixed-dim text-sm">
                Every notification is curated. No noise. Just the signals that
                matter for your project&apos;s structure.
              </p>
            </div>
            <span className="material-symbols-outlined text-6xl opacity-20">
              architecture
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
