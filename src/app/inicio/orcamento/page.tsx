import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getMinhaWedding } from "@/db/queries/weddings"

import { Progresso } from "../progresso"
import { OrcamentoForm } from "./orcamento-form"

export const metadata: Metadata = { title: "Orçamento" }

export default async function OrcamentoPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) redirect("/inicio/nomes")
  if (!wedding.convidadosEstimados) redirect("/inicio/convidados")

  return (
    <div>
      <Progresso atual={4} />
      <h1 className="font-heading mb-1 text-2xl">Qual é o orçamento?</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Usamos esse valor para sugerir categorias de gasto já com valores previstos.
      </p>
      <OrcamentoForm
        valorInicial={wedding.orcamentoTotal ? Number(wedding.orcamentoTotal) : null}
      />
    </div>
  )
}
