"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import {
  excluirComRetorno,
  restaurarLinha,
  type ResultadoExclusao,
} from "@/db/delete-helpers"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { budgetCategories, budgetItems, payments } from "@/db/schema"
import { itemOrcamentoSchema, pagamentoSchema } from "@/lib/validators/budget"

type ResultadoAction = { erro: string } | { erro?: undefined }
type BudgetItem = typeof budgetItems.$inferSelect
type Pagamento = typeof payments.$inferSelect

function revalidarOrcamento() {
  revalidatePath("/app/orcamento")
  revalidatePath("/app/alertas")
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
        observacoes: categoria.observacoes || null,
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
          observacoes: dados.data.observacoes || null,
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

export async function excluirItemOrcamento(
  id: string
): Promise<ResultadoExclusao<BudgetItem>> {
  const { rls } = await createDrizzleSupabaseClient()
  let linha: BudgetItem | null
  try {
    linha = await rls((tx) => excluirComRetorno(tx, budgetItems, budgetItems.id, id))
  } catch {
    return { erro: "Não foi possível excluir o item." }
  }
  if (!linha) return { erro: "Item não encontrado." }
  revalidarOrcamento()
  return { linha }
}

// Restaura só o item — pagamentos apagados junto por cascata (ver aviso no
// diálogo de exclusão) não voltam, mesma ressalva documentada em
// `excluirComRetorno`.
export async function restaurarItemOrcamento(item: BudgetItem): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => restaurarLinha(tx, budgetItems, item))
  } catch {
    return { erro: "Não foi possível restaurar o item." }
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

export async function atualizarPagamento(
  id: string,
  input: unknown
): Promise<ResultadoAction> {
  const dados = pagamentoSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(payments)
        .set({
          budgetItemId: dados.data.budgetItemId,
          descricao: dados.data.descricao,
          valor: String(dados.data.valor),
          vencimento: dados.data.vencimento,
          formaPagamento: dados.data.formaPagamento || null,
        })
        .where(eq(payments.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar o pagamento." }
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

export async function excluirPagamento(
  id: string
): Promise<ResultadoExclusao<Pagamento>> {
  const { rls } = await createDrizzleSupabaseClient()
  let linha: Pagamento | null
  try {
    linha = await rls((tx) => excluirComRetorno(tx, payments, payments.id, id))
  } catch {
    return { erro: "Não foi possível excluir o pagamento." }
  }
  if (!linha) return { erro: "Pagamento não encontrado." }
  revalidarOrcamento()
  return { linha }
}

export async function restaurarPagamento(pagamento: Pagamento): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => restaurarLinha(tx, payments, pagamento))
  } catch {
    return { erro: "Não foi possível restaurar o pagamento." }
  }
  revalidarOrcamento()
  return {}
}
