import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getMinhaWedding } from "@/db/queries/weddings"

import { Progresso } from "../progresso"
import { ConvidadosForm } from "./convidados-form"

export const metadata: Metadata = { title: "Convidados" }

export default async function ConvidadosPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) redirect("/inicio/nomes")
  if (!wedding.dataCasamento) redirect("/inicio/data")

  return (
    <div>
      <Progresso atual={3} />
      <h1 className="font-heading mb-1 text-2xl">Quantos convidados?</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Um número aproximado já ajuda a organizar o orçamento e o espaço.
      </p>
      <ConvidadosForm valorInicial={wedding.convidadosEstimados} />
    </div>
  )
}
