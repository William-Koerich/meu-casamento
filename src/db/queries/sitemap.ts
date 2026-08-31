import { eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { weddings } from "@/db/schema"

export async function getSlugsPublicados() {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.weddings.findMany({
      where: eq(weddings.publicado, true),
      columns: { slug: true },
    })
  )
}
