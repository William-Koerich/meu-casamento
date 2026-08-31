import { desc, eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { documents } from "@/db/schema"

export async function getDocuments(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.documents.findMany({
      where: eq(documents.weddingId, weddingId),
      with: { vendor: true },
      orderBy: desc(documents.createdAt),
    })
  )
}

export type DocumentoComFornecedor = Awaited<ReturnType<typeof getDocuments>>[number]
