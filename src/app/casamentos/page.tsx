import type { Metadata } from "next"

import { getMeusCasamentos } from "@/db/queries/weddings"

import { CasamentoCard } from "./casamento-card"
import { NovoCasamentoDialog } from "./novo-casamento-dialog"

export const metadata: Metadata = { title: "Meus casamentos" }

export default async function CasamentosPage() {
  const casamentos = await getMeusCasamentos()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl">Meus casamentos</h1>
          <p className="text-muted-foreground text-sm">
            Cadastre e acompanhe o planejamento de cada casal que você atende.
          </p>
        </div>
        <NovoCasamentoDialog />
      </div>

      {casamentos.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Nenhum casamento cadastrado ainda. Use &ldquo;Novo casamento&rdquo; para
          começar.
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
