import { and, asc, eq, isNull } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { guests, tables } from "@/db/schema"

export async function getTablesComConvidados(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.tables.findMany({
      where: eq(tables.weddingId, weddingId),
      with: { guests: true },
      orderBy: asc(tables.createdAt),
    })
  )
}

export type MesaComConvidados = Awaited<ReturnType<typeof getTablesComConvidados>>[number]

export async function getConvidadosConfirmadosSemMesa(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.guests.findMany({
      where: and(
        eq(guests.weddingId, weddingId),
        eq(guests.statusRsvp, "confirmado"),
        isNull(guests.tableId)
      ),
      orderBy: asc(guests.nome),
    })
  )
}
