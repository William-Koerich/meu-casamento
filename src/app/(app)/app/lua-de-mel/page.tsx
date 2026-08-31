import type { Metadata } from "next"

import { getHoneymoon } from "@/db/queries/honeymoon"
import { getMinhaWedding } from "@/db/queries/weddings"

import { HoneymoonForm } from "./honeymoon-form"
import { PackingChecklist } from "./packing-checklist"
import { RoteiroList } from "./roteiro-list"

export const metadata: Metadata = { title: "Lua de mel" }

export default async function LuaDeMelPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const honeymoon = await getHoneymoon(wedding.id)

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Lua de mel</h1>
      <HoneymoonForm honeymoon={honeymoon} />
      <RoteiroList roteiro={honeymoon?.roteiro ?? []} />
      <PackingChecklist checklist={honeymoon?.checklistMala ?? []} />
    </div>
  )
}
