import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { PLANO_CERIMONIALISTA_LABELS } from "@/lib/labels"
import {
  LIMITE_CASAMENTOS_POR_PLANO,
  PRECO_MENSAL_POR_PLANO,
  PRECO_NOIVA,
} from "@/lib/planos"

const ITENS_NOIVA = [
  "Checklist, orçamento e fornecedores",
  "Convidados, mesas e RSVP",
  "Equipe sem limite (noivo, madrinhas, cerimonialista)",
  "Página pública com construtor de blocos",
  "Fotos dos convidados via QR code na festa",
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
    <section className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-primary text-center text-sm font-medium tracking-widest uppercase">
        Preços
      </p>
      <h2 className="font-heading mt-2 text-center text-3xl sm:text-4xl">
        Preços simples, sem letra miúda
      </h2>

      {/* Noiva: plano único em destaque, ocupando a seção inteira. */}
      <div className="border-border bg-card mt-10 rounded-2xl border px-6 py-12 sm:px-12 sm:py-16">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm tracking-widest uppercase">
              Para noivas
            </p>
            <h3 className="font-heading mt-2 text-3xl">Plano único</h3>
            <p className="text-muted-foreground mt-2">
              Um casamento, um pagamento, sem mensalidade — o app inteiro liberado até o
              grande dia.
            </p>
            <ul className="text-muted-foreground mt-6 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {ITENS_NOIVA.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="border-primary bg-background rounded-xl border p-8 text-center">
            <p className="font-heading text-5xl">{formatCurrency(PRECO_NOIVA)}</p>
            <p className="text-muted-foreground mt-1 text-sm">pagamento único</p>
            <Button asChild size="lg" className="mt-6 w-full">
              <Link href="/cadastro">Começar</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Cerimonialista: 3 planos mensais lado a lado, cartões com a mesma
          altura e botão sempre alinhado no rodapé (flex-1 na lista). */}
      <div className="mt-16">
        <p className="text-muted-foreground text-center text-sm tracking-widest uppercase">
          Para cerimonialistas
        </p>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-center text-sm">
          Cadastre e acompanhe o casamento de vários clientes com a mesma conta.
        </p>
        <div className="mt-8 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-3">
          {PLANOS_CERIMONIALISTA.map(({ plano, destaque, descricao, itens }) => {
            const limite = LIMITE_CASAMENTOS_POR_PLANO[plano]
            return (
              <Card key={plano} className={destaque ? "border-primary h-full" : "h-full"}>
                <CardContent className="flex h-full flex-col gap-4">
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
                  <ul className="text-muted-foreground flex-1 space-y-2 text-sm">
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
