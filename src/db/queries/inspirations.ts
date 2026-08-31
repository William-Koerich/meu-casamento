import { desc, eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { inspirations } from "@/db/schema"

export async function getInspirations(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.inspirations.findMany({
      where: eq(inspirations.weddingId, weddingId),
      orderBy: desc(inspirations.createdAt),
    })
  )
}

export type Inspiracao = Awaited<ReturnType<typeof getInspirations>>[number]
