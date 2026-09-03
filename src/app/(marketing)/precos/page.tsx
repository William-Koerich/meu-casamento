import type { Metadata } from "next"

import { FaqSection } from "@/components/marketing/faq-section"
import { PricingSection } from "@/components/marketing/pricing-section"

export const metadata: Metadata = {
  title: "Preços",
  description:
    "Pagamento único para noivas planejarem o próprio casamento; planos mensais para cerimonialistas administrarem vários casamentos.",
}

export default function PrecosPage() {
  return (
    <div>
      <div className="mx-auto max-w-2xl px-6 pt-16 text-center">
        <h1 className="font-heading text-4xl">Preços</h1>
        <p className="text-muted-foreground mt-3">
          Noiva paga uma única vez, sem mensalidade. Cerimonialista assina um plano mensal
          para administrar o casamento de vários clientes.
        </p>
      </div>
      <PricingSection />
      <FaqSection />
    </div>
  )
}
