import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import SocialProof from "@/components/home/SocialProof";
import FeaturesSection from "@/components/home/FeaturesSection";
import AISpotlight from "@/components/home/AISpotlight";
import ArchitectureDiagram from "@/components/home/ArchitectureDiagram";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SocialProof />
        <FeaturesSection />
        <AISpotlight />
        <ArchitectureDiagram />
        {/* <CTASection /> */}
      </main>
      <Footer />
    </>
  );
}
