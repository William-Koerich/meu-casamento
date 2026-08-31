import { asc, eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { songs } from "@/db/schema"

export async function getSongs(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.songs.findMany({
      where: eq(songs.weddingId, weddingId),
      orderBy: asc(songs.ordem),
    })
  )
}

export type Song = Awaited<ReturnType<typeof getSongs>>[number]
