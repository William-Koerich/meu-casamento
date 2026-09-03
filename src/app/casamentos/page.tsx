import Link from "next/link"
import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getMeuPerfil } from "@/db/queries/profiles"
import { getMeusCasamentos } from "@/db/queries/weddings"
import { PLANO_CERIMONIALISTA_LABELS } from "@/lib/labels"
import { LIMITE_CASAMENTOS_POR_PLANO } from "@/lib/planos"

import { CasamentoCard } from "./casamento-card"
import { NovoCasamentoDialog } from "./novo-casamento-dialog"

export const metadata: Metadata = { title: "Meus casamentos" }

export default async function CasamentosPage() {
  const [casamentos, perfil] = await Promise.all([getMeusCasamentos(), getMeuPerfil()])
  const plano = perfil?.planoCerimonialista
  const limite = plano ? LIMITE_CASAMENTOS_POR_PLANO[plano] : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl">Meus casamentos</h1>
          <p className="text-muted-foreground text-sm">
            Cadastre e acompanhe o planejamento de cada casal que você atende.
          </p>
        </div>
        {plano ? (
          <NovoCasamentoDialog />
        ) : (
          <Button asChild>
            <Link href="/planos">Assinar um plano</Link>
          </Button>
        )}
      </div>

      {plano ? (
        <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded border p-3 text-sm">
          <Badge variant="secondary">Plano {PLANO_CERIMONIALISTA_LABELS[plano]}</Badge>
          <span className="text-muted-foreground">
            {casamentos.length} de {limite ?? "∞"} casamentos usados
          </span>
          <Link href="/planos" className="ml-auto text-xs underline">
            Gerenciar assinatura
          </Link>
        </div>
      ) : (
        <div className="border-primary bg-accent rounded border p-3 text-sm">
          Você ainda não tem uma assinatura ativa —{" "}
          <Link href="/planos" className="underline">
            assine um plano
          </Link>{" "}
          para cadastrar casamentos.
        </div>
      )}

      {casamentos.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Nenhum casamento cadastrado ainda
          {plano ? ' — use "Novo casamento" para começar.' : "."}
        </p>
      ) : (
        <div className="space-y-3">
          {casamentos.map((casamento) => (
            <CasamentoCard key={casamento.id} casamento={casamento} />
          ))}
        </div>
      )}
    </div>
  )
}
