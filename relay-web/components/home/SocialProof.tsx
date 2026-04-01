const stack = ["Next.js", "Socket.IO", "PostgreSQL", "Redis", "Vercel"];

export default function SocialProof() {
  return (
    <section className="bg-surface-container-low py-12">
      <div className="max-w-7xl mx-auto px-8">
        <p className="text-center text-secondary font-label text-[12px] uppercase tracking-[0.2em] mb-10">
          Built with enterprise-grade infrastructure
        </p>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale">
          {stack.map((name) => (
            <p key={name} className="font-serif font-bold tracking-wide">
              {name}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
