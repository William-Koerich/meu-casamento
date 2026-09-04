import Link from "next/link"

import { Button } from "@/components/ui/button"

export function FinalCta() {
  return (
    <section className="bg-primary text-primary-foreground relative overflow-hidden px-6 py-20 text-center sm:py-24">
      <div
        aria-hidden
        className="bg-primary-foreground/10 pointer-events-none absolute -top-24 -left-20 size-72 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-primary-foreground/10 pointer-events-none absolute -right-20 -bottom-24 size-72 rounded-full blur-3xl"
      />
      <div className="relative">
        <h2 className="font-heading text-3xl sm:text-4xl">
          Pronta para organizar seu casamento de verdade?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm opacity-90 sm:text-base">
          Leva menos de 5 minutos para montar o checklist e o orçamento do seu casamento —
          de graça, sem cartão.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-8 text-base">
          <Link href="/cadastro">Criar minha conta</Link>
        </Button>
      </div>
    </section>
  )
}
