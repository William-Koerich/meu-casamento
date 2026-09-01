import { asc, eq } from "drizzle-orm"
import { cache } from "react"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { pageBlocks } from "@/db/schema"

export type Block = Awaited<ReturnType<typeof getBlocosDoCasamento>>[number]

export const getBlocosDoCasamento = cache(async function getBlocosDoCasamento(
  weddingId: string
) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.pageBlocks.findMany({
      where: eq(pageBlocks.weddingId, weddingId),
      orderBy: asc(pageBlocks.ordem),
    })
  )
})
