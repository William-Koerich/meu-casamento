import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { getTrousseauItems } from "@/db/queries/trousseau"
import { getMinhaWedding } from "@/db/queries/weddings"

import { TrousseauFormDialog } from "./trousseau-form-dialog"
import { TrousseauView } from "./trousseau-view"

export const metadata: Metadata = { title: "Enxoval" }

export default async function EnxovalPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const itens = await getTrousseauItems(wedding.id)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Enxoval</h1>
        <TrousseauFormDialog trigger={<Button>Novo item</Button>} />
      </div>
      <TrousseauView itens={itens} />
    </div>
  )
}
