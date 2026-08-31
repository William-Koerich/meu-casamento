import { asc, eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { tasks } from "@/db/schema"

export async function getTarefas(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.tasks.findMany({
      where: eq(tasks.weddingId, weddingId),
      with: { responsavel: true },
      orderBy: [asc(tasks.mesesAntes), asc(tasks.ordem)],
    })
  )
}

export type TarefaComResponsavel = Awaited<ReturnType<typeof getTarefas>>[number]
