import type { Metadata } from "next"

import { FaqSection } from "@/components/marketing/faq-section"
import { PricingSection } from "@/components/marketing/pricing-section"

export const metadata: Metadata = {
  title: "Preços",
  description: "Planos simples para organizar o seu casamento, sem mensalidade.",
}

export default function PrecosPage() {
  return (
    <div>
      <div className="mx-auto max-w-2xl px-6 pt-16 text-center">
        <h1 className="font-heading text-4xl">Preços</h1>
        <p className="text-muted-foreground mt-3">
          Comece de graça. Pague uma única vez quando precisar dos módulos completos — sem
          mensalidade, sem surpresa.
        </p>
      </div>
      <PricingSection />
      <FaqSection />
    </div>
  )
}
