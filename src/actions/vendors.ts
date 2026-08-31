"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { budgetItems, vendors } from "@/db/schema"
import { fornecedorSchema } from "@/lib/validators/vendors"

type ResultadoAction = { erro: string } | { erro?: undefined; id?: string }

function revalidarFornecedores() {
  revalidatePath("/app/fornecedores")
  revalidatePath("/app/orcamento")
}

function paraValores(dados: ReturnType<typeof fornecedorSchema.parse>) {
  return {
    nome: dados.nome,
    categoria: dados.categoria as (typeof vendors.$inferInsert)["categoria"],
    contatoNome: dados.contatoNome || null,
    telefone: dados.telefone || null,
    email: dados.email || null,
    instagram: dados.instagram || null,
    site: dados.site || null,
    valorProposto: dados.valorProposto != null ? String(dados.valorProposto) : null,
    status: dados.status as (typeof vendors.$inferInsert)["status"],
    avaliacao: dados.avaliacao ?? null,
    observacoes: dados.observacoes || null,
  }
}

export async function criarFornecedor(input: unknown): Promise<ResultadoAction> {
  const dados = fornecedorSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  let id: string | undefined
  try {
    const [criado] = await rls((tx) =>
      tx
        .insert(vendors)
        .values({ weddingId: wedding.id, ...paraValores(dados.data) })
        .returning({ id: vendors.id })
    )
    id = criado?.id
  } catch {
    return { erro: "Não foi possível criar o fornecedor." }
  }

  revalidarFornecedores()
  return { id }
}

export async function atualizarFornecedor(
  id: string,
  input: unknown
): Promise<ResultadoAction> {
  const dados = fornecedorSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.update(vendors).set(paraValores(dados.data)).where(eq(vendors.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar o fornecedor." }
  }

  revalidarFornecedores()
  return { id }
}

export async function excluirFornecedor(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(vendors).where(eq(vendors.id, id)))
  } catch {
    return { erro: "Não foi possível excluir o fornecedor." }
  }

  revalidarFornecedores()
  return {}
}

export async function criarItemOrcamentoDoFornecedor(
  vendorId: string,
  categoryId: string,
  valorContratado: number
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const [vendor] = await tx
        .select({ weddingId: vendors.weddingId, nome: vendors.nome })
        .from(vendors)
        .where(eq(vendors.id, vendorId))
      if (!vendor) throw new Error("Fornecedor não encontrado.")

      await tx.insert(budgetItems).values({
        weddingId: vendor.weddingId,
        categoryId,
        vendorId,
        descricao: vendor.nome,
        valorContratado: String(valorContratado),
      })
    })
  } catch {
    return { erro: "Não foi possível criar o item de orçamento." }
  }

  revalidarFornecedores()
  return {}
}
