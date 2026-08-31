import { asc, eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { timelineEvents } from "@/db/schema"

export async function getEventos(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.timelineEvents.findMany({
      where: eq(timelineEvents.weddingId, weddingId),
      orderBy: asc(timelineEvents.ordem),
    })
  )
}

export type Evento = Awaited<ReturnType<typeof getEventos>>[number]
