"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { trousseauItems } from "@/db/schema"
import { itemEnxovalSchema } from "@/lib/validators/trousseau"

type ResultadoAction = { erro: string } | { erro?: undefined }

function revalidar() {
  revalidatePath("/app/enxoval")
}

export async function criarItemEnxoval(input: unknown): Promise<ResultadoAction> {
  const dados = itemEnxovalSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.insert(trousseauItems).values({
        weddingId: wedding.id,
        nome: dados.data.nome,
        comodo: dados.data.comodo as (typeof trousseauItems.$inferInsert)["comodo"],
        quantidade: dados.data.quantidade,
        prioridade: dados.data
          .prioridade as (typeof trousseauItems.$inferInsert)["prioridade"],
        precoEstimado:
          dados.data.precoEstimado != null ? String(dados.data.precoEstimado) : null,
      })
    )
  } catch {
    return { erro: "Não foi possível salvar o item." }
  }

  revalidar()
  return {}
}

export async function atualizarItemEnxoval(
  id: string,
  input: unknown
): Promise<ResultadoAction> {
  const dados = itemEnxovalSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(trousseauItems)
        .set({
          nome: dados.data.nome,
          comodo: dados.data.comodo as (typeof trousseauItems.$inferInsert)["comodo"],
          quantidade: dados.data.quantidade,
          prioridade: dados.data
            .prioridade as (typeof trousseauItems.$inferInsert)["prioridade"],
          precoEstimado:
            dados.data.precoEstimado != null ? String(dados.data.precoEstimado) : null,
        })
        .where(eq(trousseauItems.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar o item." }
  }

  revalidar()
  return {}
}

export async function alternarComprado(
  id: string,
  comprado: boolean
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.update(trousseauItems).set({ comprado }).where(eq(trousseauItems.id, id))
    )
  } catch {
    return { erro: "Não foi possível atualizar." }
  }

  revalidar()
  return {}
}

export async function excluirItemEnxoval(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(trousseauItems).where(eq(trousseauItems.id, id)))
  } catch {
    return { erro: "Não foi possível excluir o item." }
  }

  revalidar()
  return {}
}
