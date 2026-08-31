import { BeforeAfter } from "@/components/marketing/before-after"
import { FaqSection } from "@/components/marketing/faq-section"
import { FeaturesGrid } from "@/components/marketing/features-grid"
import { FinalCta } from "@/components/marketing/final-cta"
import { Hero } from "@/components/marketing/hero"
import { PainSection } from "@/components/marketing/pain-section"
import { PricingSection } from "@/components/marketing/pricing-section"
import { SocialProof } from "@/components/marketing/social-proof"

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <PainSection />
      <FeaturesGrid />
      <BeforeAfter />
      <SocialProof />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </div>
  )
}
