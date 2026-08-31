import type { Metadata } from "next"

import { getMinhaWedding } from "@/db/queries/weddings"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = { title: "Início" }

// Placeholder até a Fase 4 (layout e dashboard). Confirma que o onboarding
// e a leitura via RLS estão funcionando ponta a ponta.
export default async function DashboardPage() {
  const wedding = await getMinhaWedding()

  return (
    <div>
      <h1 className="font-heading text-2xl">
        {wedding?.nomeNoiva} & {wedding?.nomeNoivo}
      </h1>
      {wedding?.dataCasamento && (
        <p className="text-muted-foreground mt-1">{formatDate(wedding.dataCasamento)}</p>
      )}
    </div>
  )
}
