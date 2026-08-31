import Link from "next/link"

import { Button } from "@/components/ui/button"
import { NOME_PRODUTO } from "@/lib/site"

export function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
      <p className="text-muted-foreground text-sm tracking-widest uppercase">
        {NOME_PRODUTO}
      </p>
      <h1 className="font-heading mt-4 text-4xl sm:text-5xl">
        O planejamento do seu casamento, com calma e em um só lugar.
      </h1>
      <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg">
        Checklist, orçamento, convidados, fornecedores e equipe — tudo organizado, para
        você aproveitar mais e se preocupar menos.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/cadastro">Começar grátis</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/precos">Ver preços</Link>
        </Button>
      </div>
    </section>
  )
}
