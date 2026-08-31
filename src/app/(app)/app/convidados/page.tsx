import type { Metadata } from "next"

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
      <h1 className="font-heading mb-6 text-2xl">Convidados</h1>
      <GuestsView guests={guests} slug={wedding.slug} />
    </div>
  )
}
