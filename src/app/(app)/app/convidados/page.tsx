import type { Metadata } from "next"

import { ExportPdfButton } from "@/components/app/export-pdf-button"
import { getGuests } from "@/db/queries/guests"
import { getMinhaWedding } from "@/db/queries/weddings"

import { GuestsView } from "./guests-view"

export const metadata: Metadata = { title: "Convidados" }

export default async function ConvidadosPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const guests = await getGuests(wedding.id)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Convidados</h1>
        <ExportPdfButton rotulo="Exportar PDF" />
      </div>
      <GuestsView guests={guests} slug={wedding.slug} />
    </div>
  )
}
