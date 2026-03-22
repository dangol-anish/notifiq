import Link from "next/link";

const footerLinks = {
  Product: ["Features", "Integrations", "Enterprise", "Security"],
  Resources: ["Documentation", "API Reference", "Community", "Case Studies"],
  Company: ["About Us", "Careers", "Privacy", "Terms"],
};

export default function Footer() {
  return (
    <footer className="bg-[#f8faf8] dark:bg-[#163328] border-t border-[#c1c8c3]/20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-16 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="col-span-1">
          <Link
            href="/"
            className="font-serif text-lg font-bold text-[#163328] dark:text-[#f8faf8]"
          >
            Notifiq
          </Link>
          <p className="mt-6 text-[#47645a] dark:text-[#eceeec] text-sm tracking-tight leading-relaxed">
            Premium team synchronization for architectural workflows and design
            studios. Built with care for those who demand precision.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="font-bold text-[#163328] dark:text-white text-sm mb-6 uppercase tracking-widest">
              {heading}
            </h4>
            <ul className="space-y-4 text-sm tracking-tight text-[#47645a] dark:text-[#eceeec]">
              {links.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="hover:text-[#43270b] dark:hover:text-[#f2f4f2] transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-12 py-8 border-t border-[#c1c8c3]/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-[#47645a] dark:text-[#eceeec] text-xs tracking-tight">
          © 2026 Notifiq. Made with care.
        </span>
        {/* <div className="flex gap-6">
          <span className="material-symbols-outlined text-[#47645a] cursor-pointer">
            language
          </span>
          <span className="material-symbols-outlined text-[#47645a] cursor-pointer">
            share
          </span>
        </div> */}
      </div>
    </footer>
  );
}
