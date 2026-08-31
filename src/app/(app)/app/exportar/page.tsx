import type { Metadata } from "next"

import { ExportPdfButton } from "@/components/app/export-pdf-button"
import {
  getCategoriasComItens,
  getPagamentos,
  getResumoOrcamento,
} from "@/db/queries/budget"
import { getGuests } from "@/db/queries/guests"
import { getTarefas } from "@/db/queries/tasks"
import { getVendors } from "@/db/queries/vendors"
import { getMinhaWedding } from "@/db/queries/weddings"

import { ExportButtons } from "./export-buttons"
import { PrintSummary } from "./print-summary"

export const metadata: Metadata = { title: "Exportar" }

export default async function ExportarPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const [guests, vendors, tasks, categorias, pagamentos, orcamento] = await Promise.all([
    getGuests(wedding.id),
    getVendors(wedding.id),
    getTarefas(wedding.id),
    getCategoriasComItens(wedding.id),
    getPagamentos(wedding.id),
    getResumoOrcamento(wedding.id),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="font-heading text-2xl">Exportar</h1>
        <ExportPdfButton rotulo="Exportar PDF completo" />
      </div>
      <ExportButtons
        guests={guests}
        vendors={vendors}
        tasks={tasks}
        categorias={categorias}
        pagamentos={pagamentos}
      />
      <PrintSummary
        wedding={wedding}
        guests={guests}
        vendors={vendors}
        tasks={tasks}
        orcamento={orcamento}
      />
    </div>
  )
}
