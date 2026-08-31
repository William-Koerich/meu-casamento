import { asc, eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { guests } from "@/db/schema"

export async function getGuests(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.guests.findMany({
      where: eq(guests.weddingId, weddingId),
      with: { table: true },
      orderBy: asc(guests.nome),
    })
  )
}

export type GuestComMesa = Awaited<ReturnType<typeof getGuests>>[number]
