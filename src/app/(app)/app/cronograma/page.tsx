import type { Metadata } from "next"

import { ExportPdfButton } from "@/components/app/export-pdf-button"
import { getEventos } from "@/db/queries/timeline"
import { getMinhaWedding } from "@/db/queries/weddings"

import { TimelineView } from "./timeline-view"

export const metadata: Metadata = { title: "Cronograma" }

export default async function CronogramaPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const eventos = await getEventos(wedding.id)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Cronograma</h1>
        <ExportPdfButton />
      </div>
      <TimelineView eventos={eventos} />
    </div>
  )
}
