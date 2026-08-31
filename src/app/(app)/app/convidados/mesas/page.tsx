import type { Metadata } from "next"

import {
  getConvidadosConfirmadosSemMesa,
  getTablesComConvidados,
} from "@/db/queries/tables"
import { getMinhaWedding } from "@/db/queries/weddings"

import { ExportPdfButton } from "./export-pdf-button"
import { SeatingEditor } from "./seating-editor"

export const metadata: Metadata = { title: "Mesas" }

export default async function MesasPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const [mesas, semMesa] = await Promise.all([
    getTablesComConvidados(wedding.id),
    getConvidadosConfirmadosSemMesa(wedding.id),
  ])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Mesas</h1>
        <ExportPdfButton />
      </div>
      <SeatingEditor mesas={mesas} semMesa={semMesa} />
    </div>
  )
}
