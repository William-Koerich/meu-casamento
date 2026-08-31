"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { budgetCategories, budgetItems, payments } from "@/db/schema"
import { itemOrcamentoSchema, pagamentoSchema } from "@/lib/validators/budget"

type ResultadoAction = { erro: string } | { erro?: undefined }

function revalidarOrcamento() {
  revalidatePath("/app/orcamento")
  revalidatePath("/app")
}

export async function atualizarValorPrevistoCategoria(
  id: string,
  valor: number
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(budgetCategories)
        .set({ valorPrevisto: String(valor) })
        .where(eq(budgetCategories.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar." }
  }
  revalidarOrcamento()
  return {}
}

export async function criarItemOrcamento(input: unknown): Promise<ResultadoAction> {
  const dados = itemOrcamentoSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const categoria = dados.data
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const [category] = await tx
        .select({ weddingId: budgetCategories.weddingId })
        .from(budgetCategories)
        .where(eq(budgetCategories.id, categoria.categoryId))
      if (!category) throw new Error("Categoria não encontrada.")

      await tx.insert(budgetItems).values({
        weddingId: category.weddingId,
        categoryId: categoria.categoryId,
        vendorId: categoria.vendorId || null,
        descricao: categoria.descricao,
        valorPrevisto:
          categoria.valorPrevisto != null ? String(categoria.valorPrevisto) : null,
        valorContratado:
          categoria.valorContratado != null ? String(categoria.valorContratado) : null,
      })
    })
  } catch {
    return { erro: "Não foi possível criar o item." }
  }
  revalidarOrcamento()
  return {}
}

export async function atualizarItemOrcamento(
  id: string,
  input: unknown
): Promise<ResultadoAction> {
  const dados = itemOrcamentoSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(budgetItems)
        .set({
          categoryId: dados.data.categoryId,
          vendorId: dados.data.vendorId || null,
          descricao: dados.data.descricao,
          valorPrevisto:
            dados.data.valorPrevisto != null ? String(dados.data.valorPrevisto) : null,
          valorContratado:
            dados.data.valorContratado != null
              ? String(dados.data.valorContratado)
              : null,
        })
        .where(eq(budgetItems.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar o item." }
  }
  revalidarOrcamento()
  return {}
}

export async function atualizarValoresItem(
  id: string,
  valores: { valorPrevisto?: number; valorContratado?: number }
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(budgetItems)
        .set({
          ...(valores.valorPrevisto !== undefined && {
            valorPrevisto: String(valores.valorPrevisto),
          }),
          ...(valores.valorContratado !== undefined && {
            valorContratado: String(valores.valorContratado),
          }),
        })
        .where(eq(budgetItems.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar." }
  }
  revalidarOrcamento()
  return {}
}

export async function excluirItemOrcamento(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(budgetItems).where(eq(budgetItems.id, id)))
  } catch {
    return { erro: "Não foi possível excluir o item." }
  }
  revalidarOrcamento()
  return {}
}

export async function criarPagamento(input: unknown): Promise<ResultadoAction> {
  const dados = pagamentoSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const [item] = await tx
        .select({ weddingId: budgetItems.weddingId })
        .from(budgetItems)
        .where(eq(budgetItems.id, dados.data.budgetItemId))
      if (!item) throw new Error("Item não encontrado.")

      await tx.insert(payments).values({
        weddingId: item.weddingId,
        budgetItemId: dados.data.budgetItemId,
        descricao: dados.data.descricao,
        valor: String(dados.data.valor),
        vencimento: dados.data.vencimento,
        formaPagamento: dados.data.formaPagamento || null,
      })
    })
  } catch {
    return { erro: "Não foi possível criar o pagamento." }
  }
  revalidarOrcamento()
  return {}
}

export async function alternarPagamentoPago(
  id: string,
  pago: boolean
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(payments)
        .set({ pago, pagoEm: pago ? new Date() : null })
        .where(eq(payments.id, id))
    )
  } catch {
    return { erro: "Não foi possível atualizar o pagamento." }
  }
  revalidarOrcamento()
  return {}
}

export async function excluirPagamento(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(payments).where(eq(payments.id, id)))
  } catch {
    return { erro: "Não foi possível excluir o pagamento." }
  }
  revalidarOrcamento()
  return {}
}
