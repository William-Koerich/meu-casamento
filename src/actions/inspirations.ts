"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { inspirations } from "@/db/schema"
import { inspiracaoSchema } from "@/lib/validators/inspirations"

type ResultadoAction = { erro: string } | { erro?: undefined }

function revalidar() {
  revalidatePath("/app/inspiracoes")
}

export async function criarInspiracao(input: unknown): Promise<ResultadoAction> {
  const dados = inspiracaoSchema.safeParse(input)
  if (!dados.success) return { erro: "Dados inválidos." }
  if (!dados.data.imagemUrl && !dados.data.linkExterno) {
    return { erro: "Envie uma imagem ou cole um link." }
  }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.insert(inspirations).values({
        weddingId: wedding.id,
        titulo: dados.data.titulo || null,
        categoria: dados.data.categoria || null,
        linkExterno: dados.data.linkExterno || null,
        imagemUrl: dados.data.imagemUrl || null,
        notas: dados.data.notas || null,
      })
    )
  } catch {
    return { erro: "Não foi possível salvar." }
  }

  revalidar()
  return {}
}

export async function excluirInspiracao(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(inspirations).where(eq(inspirations.id, id)))
  } catch {
    return { erro: "Não foi possível excluir." }
  }

  revalidar()
  return {}
}
