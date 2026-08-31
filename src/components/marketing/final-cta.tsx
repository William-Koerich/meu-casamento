import Link from "next/link"

import { Button } from "@/components/ui/button"

export function FinalCta() {
  return (
    <section className="border-border border-t px-6 py-20 text-center">
      <h2 className="font-heading text-3xl">Pronta para começar a organizar?</h2>
      <p className="text-muted-foreground mx-auto mt-3 max-w-md">
        Leva menos de 5 minutos para montar o checklist e o orçamento do seu casamento.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/cadastro">Começar grátis</Link>
      </Button>
    </section>
  )
}
