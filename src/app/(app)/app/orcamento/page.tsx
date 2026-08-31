import type { Metadata } from "next"

import {
  getCategoriasComItens,
  getPagamentos,
  getResumoOrcamento,
} from "@/db/queries/budget"
import { getVendors } from "@/db/queries/vendors"
import { getMinhaWedding } from "@/db/queries/weddings"

import { OrcamentoDonut } from "./orcamento-donut"
import { OrcamentoView } from "./orcamento-view"
import { ResumoCards } from "./resumo-cards"

export const metadata: Metadata = { title: "Orçamento" }

export default async function OrcamentoPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const [resumo, categorias, pagamentos, vendors] = await Promise.all([
    getResumoOrcamento(wedding.id),
    getCategoriasComItens(wedding.id),
    getPagamentos(wedding.id),
    getVendors(wedding.id),
  ])

  const dadosDonut = categorias.map((categoria) => ({
    nome: categoria.nome,
    valor: Number(categoria.valorPrevisto),
    cor: categoria.cor ?? "#8a8378",
  }))

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Orçamento</h1>
      <ResumoCards {...resumo} />
      <div className="rounded border p-4">
        <h2 className="font-heading mb-2 text-lg">Previsto por categoria</h2>
        <OrcamentoDonut dados={dadosDonut} />
      </div>
      <OrcamentoView categorias={categorias} vendors={vendors} pagamentos={pagamentos} />
    </div>
  )
}
