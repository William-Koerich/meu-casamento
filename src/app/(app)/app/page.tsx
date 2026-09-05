import type { Metadata } from "next"
import { Suspense } from "react"

import { getMinhaWedding } from "@/db/queries/weddings"

import { CountdownCard } from "./countdown-card"
import { DashboardContent } from "./dashboard-content"
import { DashboardSkeleton } from "./dashboard-skeleton"

export const metadata: Metadata = { title: "Início" }

export default async function DashboardPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  return (
    <div className="space-y-6">
      <CountdownCard
        dataCasamento={wedding.dataCasamento}
        localFesta={wedding.localFesta}
        cidade={wedding.cidade}
        estado={wedding.estado}
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent weddingId={wedding.id} />
      </Suspense>
    </div>
  )
}
