import { eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { honeymoon } from "@/db/schema"

export async function getHoneymoon(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.honeymoon.findFirst({ where: eq(honeymoon.weddingId, weddingId) })
  )
}

export type Honeymoon = Awaited<ReturnType<typeof getHoneymoon>>
