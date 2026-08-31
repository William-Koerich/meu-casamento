"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { gifts } from "@/db/schema"
import { presenteSchema } from "@/lib/validators/gifts"

type ResultadoAction = { erro: string } | { erro?: undefined }

function revalidar() {
  revalidatePath("/app/presentes")
}

export async function criarPresente(input: unknown): Promise<ResultadoAction> {
  const dados = presenteSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.insert(gifts).values({
        weddingId: wedding.id,
        nome: dados.data.nome,
        descricao: dados.data.descricao || null,
        preco: dados.data.preco != null ? String(dados.data.preco) : null,
        linkLoja: dados.data.linkLoja || null,
        chavePix: dados.data.chavePix || null,
        imagemUrl: dados.data.imagemUrl || null,
      })
    )
  } catch {
    return { erro: "Não foi possível salvar o presente." }
  }

  revalidar()
  return {}
}

export async function atualizarPresente(
  id: string,
  input: unknown
): Promise<ResultadoAction> {
  const dados = presenteSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(gifts)
        .set({
          nome: dados.data.nome,
          descricao: dados.data.descricao || null,
          preco: dados.data.preco != null ? String(dados.data.preco) : null,
          linkLoja: dados.data.linkLoja || null,
          chavePix: dados.data.chavePix || null,
          imagemUrl: dados.data.imagemUrl || null,
        })
        .where(eq(gifts.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar o presente." }
  }

  revalidar()
  return {}
}

export async function alternarRecebido(
  id: string,
  recebido: boolean
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.update(gifts).set({ recebido }).where(eq(gifts.id, id)))
  } catch {
    return { erro: "Não foi possível atualizar." }
  }

  revalidar()
  return {}
}

export async function excluirPresente(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(gifts).where(eq(gifts.id, id)))
  } catch {
    return { erro: "Não foi possível excluir o presente." }
  }

  revalidar()
  return {}
}
