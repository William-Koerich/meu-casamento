import { desc, eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { gifts } from "@/db/schema"

export async function getGifts(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.gifts.findMany({
      where: eq(gifts.weddingId, weddingId),
      orderBy: desc(gifts.createdAt),
    })
  )
}

export type Gift = Awaited<ReturnType<typeof getGifts>>[number]
