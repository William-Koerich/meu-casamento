import { asc, eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { vendors } from "@/db/schema"

export async function getVendors(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.vendors.findMany({
      where: eq(vendors.weddingId, weddingId),
      orderBy: [asc(vendors.categoria), asc(vendors.nome)],
    })
  )
}

export type Vendor = Awaited<ReturnType<typeof getVendors>>[number]

export async function getVendor(id: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.vendors.findFirst({
      where: eq(vendors.id, id),
      with: {
        documents: true,
        budgetItems: { with: { payments: true } },
      },
    })
  )
}
