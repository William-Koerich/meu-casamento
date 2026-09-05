import { addDays, format } from "date-fns"
import { and, asc, eq, gte, lt, lte } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { payments, tasks } from "@/db/schema"
import { hojeISO } from "@/lib/format"

// Mesmos critérios já usados em cada módulo (não duplica lógica nova):
// tarefa atrasada é `prazo < hoje` igual a `task-row.tsx`/`checklist-view.tsx`;
// pagamento vencido é `vencimento < hoje` igual a `payments-tab.tsx`.
export async function getAlertas(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  const hoje = hojeISO()
  const em7dias = format(addDays(new Date(), 7), "yyyy-MM-dd")

  return rls(async (tx) => {
    const tarefasAtrasadas = await tx.query.tasks.findMany({
      where: and(
        eq(tasks.weddingId, weddingId),
        eq(tasks.concluida, false),
        lt(tasks.prazo, hoje)
      ),
      with: { responsavel: true },
      orderBy: asc(tasks.prazo),
    })

    const pagamentosVencidos = await tx.query.payments.findMany({
      where: and(
        eq(payments.weddingId, weddingId),
        eq(payments.pago, false),
        lt(payments.vencimento, hoje)
      ),
      with: { budgetItem: true },
      orderBy: asc(payments.vencimento),
    })

    const pagamentosProximos = await tx.query.payments.findMany({
      where: and(
        eq(payments.weddingId, weddingId),
        eq(payments.pago, false),
        gte(payments.vencimento, hoje),
        lte(payments.vencimento, em7dias)
      ),
      with: { budgetItem: true },
      orderBy: asc(payments.vencimento),
    })

    return { tarefasAtrasadas, pagamentosVencidos, pagamentosProximos }
  })
}

export type Alertas = Awaited<ReturnType<typeof getAlertas>>
