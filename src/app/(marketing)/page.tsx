import { FaqSection } from "@/components/marketing/faq-section"
import { FeaturesGrid } from "@/components/marketing/features-grid"
import { FinalCta } from "@/components/marketing/final-cta"
import { Hero } from "@/components/marketing/hero"
import { PricingSection } from "@/components/marketing/pricing-section"
import { ProblemaSolucao } from "@/components/marketing/problema-solucao"
import { SocialProof } from "@/components/marketing/social-proof"

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <ProblemaSolucao />
      <FeaturesGrid />
      <SocialProof />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </div>
  )
}
