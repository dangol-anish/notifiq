import Image from "next/image";

const feature1Bullets = [
  "Sub-millisecond real-time state synchronization.",
  "Integrated asset versioning and review.",
];

export default function FeaturesSection() {
  return (
    <section className="py-32 space-y-32">
      {/* Feature 1 */}
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-4xl font-headline font-bold text-primary mb-6">
            Built for precision.
          </h2>
          <p className="text-lg text-secondary leading-relaxed mb-8">
            Our interface is stripped of unnecessary noise. Focus on what
            matters with a high-density dashboard that prioritizes content over
            chrome.
          </p>
          <ul className="space-y-4">
            {feature1Bullets.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary  flex justify-center items-center">
                  check_circle
                </span>
                <span className="text-on-surface">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface-container p-8 rounded-sm">
          <div className="aspect-video bg-surface-container-lowest rounded-sm shadow-sm border border-outline-variant/10 overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXMVZtJZwjH3TjBP8w1AmO6nNbaYD6hZAR_9IBKFTQ9f__6fMxq6t4fbwqWzxCvcBFYnKheh4Gkagx3qdbiJ9Qf1OnX4gHnBcGWe7EATxn3gD7lguBvNVwFRD3mZ8gwRyNcFBRVYcnARcqrA4V0SiDBfabDx417I7vNarZZS52t_exP1kaOBQ5J6ZpzV4IdfbyfHa7pw8kINESNXvzRrPbpZwCTa5EIh_exGsTDzC9_Df4F7o882cdFmUPRFhGTCxm86nDCGYRN4s"
              alt="Clean software dashboard"
              width={800}
              height={450}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Feature 2 (reversed) */}
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="order-2 md:order-1 bg-surface-container-high p-8 rounded-sm">
          <div className="aspect-video bg-surface-container-lowest rounded-sm shadow-sm border border-outline-variant/10 overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsbodYT8bP4OLDgc6HkRdfWqoQHN44iNS0Bwxid9gLQFunfwpRmR601LXIDhGLMXubVz1X6S_w197reiwVAty9vxlxQhfR0Ob12bq9l1cihg76avJ9AouWv1-hbAeuVG89hZgAFfF3F026PubkdKwQDNnbBBgvmSt9wyim2OD5mQcjaxZ3OmHInigd9XkfmvGjgPKWxPWWJU1gpD5gBdwOl57LN1Keyn73PVdJrhOEDONB_oQY2cTa2QrFCT3x4CH_qZCdye8FPtA"
              alt="Architectural workflow visualization"
              width={800}
              height={450}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-4xl font-headline font-bold text-primary mb-6">
            Seamless integration.
          </h2>
          <p className="text-lg text-secondary leading-relaxed mb-8">
            Your existing stack is powerful. Notifiq acts as the connective
            tissue, binding your tools into a single source of truth.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container-low rounded-sm">
              <span className="material-symbols-outlined text-tertiary mb-2 block">
                hub
              </span>
              <h4 className="font-bold text-primary text-sm">200+ Plugins</h4>
            </div>
            <div className="p-4 bg-surface-container-low rounded-sm">
              <span className="material-symbols-outlined text-tertiary mb-2 block">
                code
              </span>
              <h4 className="font-bold text-primary text-sm">API First</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
