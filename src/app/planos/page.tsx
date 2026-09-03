import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getMeuPerfil } from "@/db/queries/profiles"
import { formatCurrency } from "@/lib/format"
import { PLANO_CERIMONIALISTA_LABELS } from "@/lib/labels"
import { LIMITE_CASAMENTOS_POR_PLANO, PRECO_MENSAL_POR_PLANO } from "@/lib/planos"

import { AssinarButton } from "./assinar-button"
import { GerenciarAssinaturaButton } from "./gerenciar-assinatura-button"

export const metadata: Metadata = { title: "Planos" }

const PLANOS = [
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

export default async function PlanosPage() {
  const perfil = await getMeuPerfil()
  const planoAtual = perfil?.planoCerimonialista

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl">Planos</h1>
          <p className="text-muted-foreground text-sm">
            {planoAtual
              ? "Gerencie sua assinatura ou veja os outros planos disponíveis."
              : "Assine um plano para começar a cadastrar casamentos."}
          </p>
        </div>
        {planoAtual && <GerenciarAssinaturaButton />}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-3">
        {PLANOS.map(({ plano, destaque, descricao, itens }) => {
          const limite = LIMITE_CASAMENTOS_POR_PLANO[plano]
          const ehAtual = planoAtual === plano
          return (
            <Card key={plano} className={destaque ? "border-primary h-full" : "h-full"}>
              <CardContent className="flex h-full flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl">
                    {PLANO_CERIMONIALISTA_LABELS[plano]}
                  </h3>
                  {ehAtual && <Badge>Seu plano</Badge>}
                </div>
                <p className="text-muted-foreground text-sm">{descricao}</p>
                <p className="font-heading text-3xl">
                  {formatCurrency(PRECO_MENSAL_POR_PLANO[plano])}
                  <span className="text-muted-foreground text-sm font-normal">/mês</span>
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
                {ehAtual ? (
                  <GerenciarAssinaturaButton />
                ) : (
                  <AssinarButton plano={plano} destaque={destaque} />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
