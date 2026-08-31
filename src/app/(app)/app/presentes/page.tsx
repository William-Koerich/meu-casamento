import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { getGifts } from "@/db/queries/gifts"
import { getMinhaWedding } from "@/db/queries/weddings"

import { GiftFormDialog } from "./gift-form-dialog"
import { GiftsGrid } from "./gifts-grid"

export const metadata: Metadata = { title: "Presentes" }

export default async function PresentesPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const gifts = await getGifts(wedding.id)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Presentes</h1>
        <GiftFormDialog weddingId={wedding.id} trigger={<Button>Novo presente</Button>} />
      </div>
      <GiftsGrid gifts={gifts} weddingId={wedding.id} />
    </div>
  )
}
