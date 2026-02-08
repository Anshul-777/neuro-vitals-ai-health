import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WorkflowSection from "@/components/landing/WorkflowSection";
import ResultsTiersSection from "@/components/landing/ResultsTiersSection";
import FooterSection from "@/components/landing/FooterSection";

const LandingPage = () => (
  <div className="min-h-screen bg-background">
    <HeroSection />
    <FeaturesSection />
    <WorkflowSection />
    <ResultsTiersSection />
    <FooterSection />
  </div>
);

export default LandingPage;
