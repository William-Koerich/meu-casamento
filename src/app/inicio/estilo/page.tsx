import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getMinhaWedding } from "@/db/queries/weddings"
import type { EstiloCasamento } from "@/lib/estilos-casamento"

import { Progresso } from "../progresso"
import { EstiloForm } from "./estilo-form"

export const metadata: Metadata = { title: "Estilo do casamento" }

export default async function EstiloPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) redirect("/inicio/nomes")
  if (!wedding.orcamentoTotal) redirect("/inicio/orcamento")

  return (
    <div>
      <Progresso atual={5} />
      <h1 className="font-heading mb-1 text-2xl">Qual é o estilo de vocês?</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Isso ajuda a personalizar sugestões mais pra frente.
      </p>
      <EstiloForm valorInicial={wedding.estilo as EstiloCasamento | null} />
    </div>
  )
}
