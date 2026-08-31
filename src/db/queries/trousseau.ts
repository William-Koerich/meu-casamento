import { asc, eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { trousseauItems } from "@/db/schema"

export async function getTrousseauItems(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.trousseauItems.findMany({
      where: eq(trousseauItems.weddingId, weddingId),
      orderBy: asc(trousseauItems.createdAt),
    })
  )
}

export type ItemEnxoval = Awaited<ReturnType<typeof getTrousseauItems>>[number]
