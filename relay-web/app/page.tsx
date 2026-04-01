import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import SocialProof from "@/components/home/SocialProof";
import FeaturesSection from "@/components/home/FeaturesSection";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SocialProof />
        <FeaturesSection />
      </main>
      <Footer />
    </>
  );
}
