import { BenefitsSection } from "@/components/home/benefits-section";
import { CategorySection } from "@/components/home/category-section";
import { FeaturedSection } from "@/components/home/featured-section";
import { HeroSection } from "@/components/home/hero-section";
import { Reveal } from "@/components/home/reveal";
import { WorkflowSection } from "@/components/home/workflow-section";

export default function Home() {
  return (
    <>
      <Reveal>
        <HeroSection />
      </Reveal>

      <Reveal delay={0.08}>
        <FeaturedSection />
      </Reveal>

      <Reveal delay={0.12}>
        <CategorySection />
      </Reveal>

      <Reveal delay={0.16}>
        <BenefitsSection />
      </Reveal>

      <Reveal delay={0.2}>
        <WorkflowSection />
      </Reveal>
    </>
  );
}
