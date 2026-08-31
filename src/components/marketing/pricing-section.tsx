import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"

const PLANOS = [
  {
    nome: "Essencial",
    preco: 0,
    descricao: "Para começar a organizar sem compromisso.",
    itens: [
      "Checklist de 12 meses",
      "Orçamento e fornecedores",
      "Até 1 pessoa na equipe",
    ],
  },
  {
    nome: "Completo",
    preco: 149,
    descricao: "Pagamento único, válido até o grande dia.",
    destaque: true,
    itens: [
      "Tudo do Essencial",
      "Convidados, mesas e RSVP",
      "Equipe sem limite (noivo, madrinhas, cerimonialista)",
      "Página pública do casal e exportação em PDF/CSV",
    ],
  },
]

export function PricingSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="font-heading text-center text-3xl">
        Preços simples, sem letra miúda
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {PLANOS.map((plano) => (
          <Card
            key={plano.nome}
            className={plano.destaque ? "border-primary" : undefined}
          >
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-heading text-xl">{plano.nome}</h3>
                <p className="text-muted-foreground text-sm">{plano.descricao}</p>
              </div>
              <p className="font-heading text-3xl">
                {plano.preco === 0 ? "Grátis" : formatCurrency(plano.preco)}
              </p>
              <ul className="text-muted-foreground space-y-2 text-sm">
                {plano.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full"
                variant={plano.destaque ? "default" : "outline"}
              >
                <Link href="/cadastro">Começar</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
