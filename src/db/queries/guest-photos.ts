import { desc, eq } from "drizzle-orm"
import { cache } from "react"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { guestPhotos } from "@/db/schema"

export type GuestPhoto = Awaited<ReturnType<typeof getFotosConvidados>>[number]

export const getFotosConvidados = cache(async function getFotosConvidados(
  weddingId: string
) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.guestPhotos.findMany({
      where: eq(guestPhotos.weddingId, weddingId),
      orderBy: desc(guestPhotos.createdAt),
    })
  )
})
