import { addDays, format } from "date-fns"
import { and, asc, count, eq, gte, lt, lte, sql } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import {
  budgetCategories,
  budgetItems,
  guests,
  payments,
  tasks,
  vendors,
} from "@/db/schema"

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>

// Todas as consultas do dashboard rodam dentro de uma única transação
// (uma chamada a `rls`) para evitar ida e volta repetida ao banco — nenhuma
// delas itera por linha (sem N+1), são agregações de tamanho fixo.
export async function getDashboardData(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  const hoje = format(new Date(), "yyyy-MM-dd")
  const em7dias = format(addDays(new Date(), 7), "yyyy-MM-dd")

  return rls(async (tx) => {
    const [checklist] = await tx
      .select({
        total: count(),
        concluidas: sql<string>`count(*) filter (where ${tasks.concluida})`,
      })
      .from(tasks)
      .where(eq(tasks.weddingId, weddingId))

    const [previstoResult] = await tx
      .select({
        previsto: sql<string>`coalesce(sum(${budgetCategories.valorPrevisto}), 0)`,
      })
      .from(budgetCategories)
      .where(eq(budgetCategories.weddingId, weddingId))

    const [contratadoResult] = await tx
      .select({
        contratado: sql<string>`coalesce(sum(${budgetItems.valorContratado}), 0)`,
      })
      .from(budgetItems)
      .where(eq(budgetItems.weddingId, weddingId))

    const [pagoResult] = await tx
      .select({ pago: sql<string>`coalesce(sum(${payments.valor}), 0)` })
      .from(payments)
      .where(and(eq(payments.weddingId, weddingId), eq(payments.pago, true)))

    const proximasTarefas = await tx.query.tasks.findMany({
      where: and(eq(tasks.weddingId, weddingId), eq(tasks.concluida, false)),
      orderBy: asc(tasks.prazo),
      limit: 5,
    })

    // `lt` (não `lte`): mesmo critério de "atrasada" que `task-row.tsx`/
    // `checklist-view.tsx` usam pra mostrar o rótulo vermelho — antes esta
    // consulta usava `lte` (contava tarefa com prazo hoje como atrasada) e
    // o card do dashboard podia mostrar um número que a tela de Alertas
    // (Fase 19) não confirmava.
    const [tarefasAtrasadas] = await tx
      .select({ total: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.weddingId, weddingId),
          eq(tasks.concluida, false),
          lt(tasks.prazo, hoje)
        )
      )

    // Mesmo critério de "vencido" que `payments-tab.tsx` usa (`< hoje`) —
    // antes só existia a contagem de "vencendo nos próximos 7 dias", que
    // não inclui pagamento já vencido nenhum (`gte(hoje)` exclui o passado).
    const [pagamentosVencidos] = await tx
      .select({ total: count() })
      .from(payments)
      .where(
        and(
          eq(payments.weddingId, weddingId),
          eq(payments.pago, false),
          lt(payments.vencimento, hoje)
        )
      )

    const [pagamentosVencendo] = await tx
      .select({ total: count() })
      .from(payments)
      .where(
        and(
          eq(payments.weddingId, weddingId),
          eq(payments.pago, false),
          gte(payments.vencimento, hoje),
          lte(payments.vencimento, em7dias)
        )
      )

    const rsvpPorStatus = await tx
      .select({ status: guests.statusRsvp, total: count() })
      .from(guests)
      .where(eq(guests.weddingId, weddingId))
      .groupBy(guests.statusRsvp)

    const buscarTotalRsvp = (status: (typeof rsvpPorStatus)[number]["status"]) =>
      rsvpPorStatus.find((linha) => linha.status === status)?.total ?? 0

    // Cabeças de verdade (convidado + acompanhantes) entre quem confirmou —
    // número mais útil pra planejar buffet/lugar do que só a contagem de
    // linhas de `guests`, que ignora acompanhante.
    const [pessoasConfirmadasResult] = await tx
      .select({
        total: sql<string>`coalesce(sum(1 + ${guests.acompanhantes}), 0)`,
      })
      .from(guests)
      .where(and(eq(guests.weddingId, weddingId), eq(guests.statusRsvp, "confirmado")))

    const [fornecedoresResult] = await tx
      .select({
        total: count(),
        contratados: sql<string>`count(*) filter (where ${vendors.status} = 'contratado')`,
      })
      .from(vendors)
      .where(eq(vendors.weddingId, weddingId))

    return {
      checklist: {
        total: checklist?.total ?? 0,
        concluidas: Number(checklist?.concluidas ?? 0),
      },
      orcamento: {
        previsto: Number(previstoResult?.previsto ?? 0),
        contratado: Number(contratadoResult?.contratado ?? 0),
        pago: Number(pagoResult?.pago ?? 0),
      },
      proximasTarefas,
      tarefasAtrasadas: tarefasAtrasadas?.total ?? 0,
      pagamentosVencidos: pagamentosVencidos?.total ?? 0,
      pagamentosVencendo: pagamentosVencendo?.total ?? 0,
      rsvp: {
        confirmado: buscarTotalRsvp("confirmado"),
        pendente: buscarTotalRsvp("pendente"),
        recusado: buscarTotalRsvp("recusado"),
        pessoasConfirmadas: Number(pessoasConfirmadasResult?.total ?? 0),
      },
      fornecedores: {
        total: fornecedoresResult?.total ?? 0,
        contratados: Number(fornecedoresResult?.contratados ?? 0),
      },
    }
  })
}
