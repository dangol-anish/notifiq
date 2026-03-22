export default function CTASection() {
  return (
    <section className="py-24 px-8">
      <div className="max-w-7xl mx-auto bg-gradient-to-br from-primary-container to-surface-container-high rounded-sm p-16 relative overflow-hidden text-center">
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-6">
            Ready to sync your team?
          </h2>
          <p className="text-secondary max-w-xl mx-auto mb-10 text-lg">
            Join 4,000+ teams building the future of architecture and design on
            Notifiq.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-on-primary px-10 py-4 text-base font-semibold rounded-sm hover:opacity-95 transition-all">
              Start your 14-day trial
            </button>
            <button className="bg-transparent border border-primary text-primary px-10 py-4 text-base font-semibold rounded-sm hover:bg-white/10 transition-all">
              Schedule a demo
            </button>
          </div>
        </div>
        {/* Abstract blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      </div>
    </section>
  );
}
