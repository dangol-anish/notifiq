import Image from "next/image";
import Link from "next/link";

export default function FeaturesSection() {
  return (
    <section className="bg-background py-22">
      <div className="mx-auto max-w-7xl space-y-18 px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <h2 className="text-3xl font-headline font-bold text-primary">
              A calm surface for daily work.
            </h2>
            <p className="mt-4 text-secondary">
              Tasks stay organized. Updates arrive instantly. The interface
              stays out of the way.
            </p>

            <div className="mt-8 space-y-3">
              <Bullet icon="notifications" text="Real-time notification stream with read state." />
              <Bullet icon="fact_check" text="Projects + tasks with clear status and ownership." />
              <Bullet icon="person_search" text="Fast search across your workspace." />
            </div>

            <div className="mt-10 rounded-sm border border-outline-variant/20 bg-surface-container-low p-6">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-tertiary">
                Start in minutes
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-opacity hover:opacity-95 active:opacity-90"
                >
                  Create account
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-sm border border-outline-variant/60 bg-surface-container-lowest px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-container"
                >
                  Go to dashboard
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-sm">
              <div className="overflow-hidden rounded-sm border border-outline-variant/10">
                <Image
                  src="/2.png"
                  alt="Notifiq workspace view"
                  width={1400}
                  height={900}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Step
              icon="domain"
              title="Create a workspace"
              description="Invite teammates and set roles."
            />
            <Step
              icon="view_kanban"
              title="Track projects"
              description="Keep tasks moving with simple status."
            />
            <Step
              icon="bolt"
              title="Stay current"
              description="Get updates instantly or in a weekly digest."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Bullet({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined mt-0.5 text-primary">
        {icon}
      </span>
      <p className="text-sm leading-relaxed text-on-surface">{text}</p>
    </div>
  );
}

function Step({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-6">
      <span className="material-symbols-outlined text-tertiary">{icon}</span>
      <p className="mt-4 text-sm font-semibold text-primary">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-secondary">
        {description}
      </p>
    </div>
  );
}
