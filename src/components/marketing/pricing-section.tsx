import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PLANO_CERIMONIALISTA_LABELS } from "@/lib/labels"
import {
  LIMITE_CASAMENTOS_POR_PLANO,
  PRECO_MENSAL_POR_PLANO,
  PRECO_NOIVA,
} from "@/lib/planos"
import { formatCurrency } from "@/lib/format"

const ITENS_NOIVA = [
  "Checklist, orçamento e fornecedores",
  "Convidados, mesas e RSVP",
  "Equipe sem limite (noivo, madrinhas, cerimonialista)",
  "Página pública com construtor de blocos",
  "Fotos dos convidados via QR code na festa",
  "Pagamento único — sem mensalidade",
]

const PLANOS_CERIMONIALISTA = [
  {
    plano: "basico" as const,
    descricao: "Pra quem está começando a atender casamentos.",
    itens: ["Checklist, orçamento e cronograma de cada casamento", "Suporte por e-mail"],
  },
  {
    plano: "premium" as const,
    destaque: true,
    descricao: "Pra quem já tem uma agenda cheia de clientes.",
    itens: [
      "Tudo do Básico",
      "Convidados, mesas e RSVP de cada casamento",
      "Suporte prioritário",
    ],
  },
  {
    plano: "platinum" as const,
    descricao: "Pra cerimonialista ou buffer sem limite de clientes.",
    itens: [
      "Tudo do Premium",
      "Casamentos simultâneos ilimitados",
      "Suporte prioritário via WhatsApp",
    ],
  },
]

export function PricingSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="font-heading text-center text-3xl">
        Preços simples, sem letra miúda
      </h2>

      <div className="mt-10">
        <p className="text-muted-foreground text-center text-sm tracking-widest uppercase">
          Para noivas
        </p>
        <Card className="border-primary mx-auto mt-4 max-w-sm">
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-heading text-xl">Plano único</h3>
              <p className="text-muted-foreground text-sm">
                Um casamento, um pagamento, sem mensalidade.
              </p>
            </div>
            <p className="font-heading text-3xl">{formatCurrency(PRECO_NOIVA)}</p>
            <ul className="text-muted-foreground space-y-2 text-sm">
              {ITENS_NOIVA.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Button asChild className="w-full">
              <Link href="/cadastro">Começar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16">
        <p className="text-muted-foreground text-center text-sm tracking-widest uppercase">
          Para cerimonialistas
        </p>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-center text-sm">
          Cadastre e acompanhe o casamento de vários clientes com a mesma conta.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PLANOS_CERIMONIALISTA.map(({ plano, destaque, descricao, itens }) => {
            const limite = LIMITE_CASAMENTOS_POR_PLANO[plano]
            return (
              <Card key={plano} className={destaque ? "border-primary" : undefined}>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-heading text-xl">
                      {PLANO_CERIMONIALISTA_LABELS[plano]}
                    </h3>
                    <p className="text-muted-foreground text-sm">{descricao}</p>
                  </div>
                  <p className="font-heading text-3xl">
                    {formatCurrency(PRECO_MENSAL_POR_PLANO[plano])}
                    <span className="text-muted-foreground text-sm font-normal">
                      /mês
                    </span>
                  </p>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li className="text-foreground font-medium">
                      {limite
                        ? `Até ${limite} casamentos simultâneos`
                        : "Casamentos ilimitados"}
                    </li>
                    {itens.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full"
                    variant={destaque ? "default" : "outline"}
                  >
                    <Link href="/cadastro">Começar</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
