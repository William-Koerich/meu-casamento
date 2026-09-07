import { asc, eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { notes } from "@/db/schema"

export async function getAnotacoes(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.notes.findMany({
      where: eq(notes.weddingId, weddingId),
      orderBy: asc(notes.ordem),
    })
  )
}

export type Nota = Awaited<ReturnType<typeof getAnotacoes>>[number]
