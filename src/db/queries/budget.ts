import { and, asc, eq, sql } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { budgetCategories, budgetItems, payments } from "@/db/schema"

export async function getResumoOrcamento(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()

  return rls(async (tx) => {
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

    const previsto = Number(previstoResult?.previsto ?? 0)
    const contratado = Number(contratadoResult?.contratado ?? 0)
    const pago = Number(pagoResult?.pago ?? 0)

    return { previsto, contratado, pago, saldo: previsto - pago }
  })
}

export async function getCategoriasComItens(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()

  return rls((tx) =>
    tx.query.budgetCategories.findMany({
      where: eq(budgetCategories.weddingId, weddingId),
      orderBy: asc(budgetCategories.ordem),
      with: {
        items: { with: { vendor: true }, orderBy: asc(budgetItems.createdAt) },
      },
    })
  )
}

export type CategoriaComItens = Awaited<ReturnType<typeof getCategoriasComItens>>[number]

export async function getPagamentos(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()

  return rls((tx) =>
    tx.query.payments.findMany({
      where: eq(payments.weddingId, weddingId),
      with: { budgetItem: true },
      orderBy: asc(payments.vencimento),
    })
  )
}

export type PagamentoComItem = Awaited<ReturnType<typeof getPagamentos>>[number]
