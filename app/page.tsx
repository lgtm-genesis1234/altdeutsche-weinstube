import { HeroSection } from "@/components/hero-section";
import { FeatureGrid } from "@/components/feature-grid";
import { Testimonials } from "@/components/testimonials";
import { CTASection } from "@/components/cta-section";
import { AIChatWidget } from "@/components/ai-chat-widget";

export default function Home() {
  return (
    <main id="main-content">
      <HeroSection />
      <FeatureGrid />
      <Testimonials />
      <CTASection />
      <AIChatWidget />
    </main>
  );
}
