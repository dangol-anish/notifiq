import Image from "next/image";

const logos = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVzn5t-mecD14kX7njF-ZV2LZPE97Tzrc9tzkJLctLC2PGvM3-63Al7sw2ZaKwkdaiy2TXdgjuIutQsj2D_PS-1W16M2nkZRuypFVlSqvyb0ENrVxgIL7Xuj8kHycJH9DrimCupZeRL5gPD8XeATI50YKtNutrrMdo-aVeJrFiN11pxnwUpRWMwzQFOUP9y501IWULD3bD7rBt40TXEDIvoBhWumlrwpFPSLFc0ippQugbgIGArf2qSti8Ev8TiepOkZsGsKK253g",
    alt: "Next.js",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAWa5OfqrVtvBDNjIws5B8Lq0GUEsH4CapfmPGauhN8lLGNozP1TxXLj4A6DrCn2QnDvyB6Hu36Qb4ik3lSF0SzH-wIy9TisXR1dMrPr2GAaDcK8gOb-Wz9AvZ_l_HKCunL66-C9nZfftpwOQa3gge4yVMwMRxF2YUwi9P6YgZ6Fy2Fyl5KbwphUfXxiRApSmSeBUm363vgrCUlqHwLjfvfykh8Sa66Aqqqxqt1OpaD0iaSFUQOeq6fl0ZX4MmwOKTndKeoJeXoQQ",
    alt: "Socket.IO",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCPRHTDFM0-YG3u-W8cYL-8ICeVRqdxC2jHaYWrmGih8jHmM8qxyweP5_was77I4XImp9cjXewfnEspZngzvJWH0VKAnk_-TvhhJhjpUiig1CWWZvubN5qH89RGEJuMVMqcsho41GZPs_aGWUgl_tRKWRfkasiQNpqXQVm8QBhqsjbY8gtVH8wGqbH_fXTyDpShnU_6ZZaGfwWIePOc-6cv8wICcem3cYuxIuGsPHWcM5KdbGSzfN3xY5I6GglzoF_wJlx1VvfukA",
    alt: "PostgreSQL",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHjEHJ8HV4rXvYlsWpqywBiYEHJC6fCjBHngRZKgYTgiHCFj97qUKE7gWTyffyIwqJVomehNV2lr6sr339Li8Wk5fzasAnvPmn32RxTPbesH8UDhHX_2ZAuJdLHAJLwnNgsImV2-rOwc8tSCL87QY2uYfBBH8jPU9ENeSixHBdB53-Jet3_n7Dc5JIRo-Ry5fJ0XnMCkHBN0a7vIlH70S8-eBhxLv1wkuYuKtsByOhsO3KxgFPEVXuRkBqpjhCjOP2M8hXafhA0lw",
    alt: "Redis",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCq8Qlvs8npT5HUXD7lXNurjGjz6vHpWWZY6uIzVP-ybqyt5Ds7awBRgLVAJrY2UF0VnJr8QrDws9tixHol95K_7Wyp6pBG_H9igePUqOSMDRb7ruWcEvnwXCCZVv5XeVGvZeUEBeOSl53gHSdzeznzSdqtpI17yiRyhfdlnhJo_uikG0xut2Bk28J_E2GvHesUhEJJzh4ufu8R1Fzse0ljD9fY9vpTdZO0Fs_LkD1SZKVG-B4vvCo0uwcd4G1rRcw2etnyaNhOnKY",
    alt: "Vercel",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCq8Qlvs8npT5HUXD7lXNurjGjz6vHpWWZY6uIzVP-ybqyt5Ds7awBRgLVAJrY2UF0VnJr8QrDws9tixHol95K_7Wyp6pBG_H9igePUqOSMDRb7ruWcEvnwXCCZVv5XeVGvZeUEBeOSl53gHSdzeznzSdqtpI17yiRyhfdlnhJo_uikG0xut2Bk28J_E2GvHesUhEJJzh4ufu8R1Fzse0ljD9fY9vpTdZO0Fs_LkD1SZKVG-B4vvCo0uwcd4G1rRcw2etnyaNhOnKY",
    alt: "Gemini",
  },
];

export default function SocialProof() {
  return (
    <section className="bg-surface-container-low py-12">
      <div className="max-w-7xl mx-auto px-8">
        <p className="text-center text-secondary font-label text-[12px] uppercase tracking-[0.2em] mb-10">
          Built with enterprise-grade infrastructure
        </p>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale">
          {logos.map((logo) => (
            <p className="font-serif font-bold tracking-wide">{logo.alt}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
