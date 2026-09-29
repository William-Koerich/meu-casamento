"use server"

import { revalidatePath } from "next/cache"

import {
  excluirComRetorno,
  restaurarLinha,
  type ResultadoExclusao,
} from "@/db/delete-helpers"
import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { inspirations } from "@/db/schema"
import { inspiracaoSchema } from "@/lib/validators/inspirations"

type ResultadoAction = { erro: string } | { erro?: undefined }
type Inspiracao = typeof inspirations.$inferSelect

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

export async function excluirInspiracao(
  id: string
): Promise<ResultadoExclusao<Inspiracao>> {
  const { rls } = await createDrizzleSupabaseClient()
  let linha: Inspiracao | null
  try {
    linha = await rls((tx) => excluirComRetorno(tx, inspirations, inspirations.id, id))
  } catch {
    return { erro: "Não foi possível excluir." }
  }
  if (!linha) return { erro: "Inspiração não encontrada." }

  revalidar()
  return { linha }
}

export async function restaurarInspiracao(
  inspiracao: Inspiracao
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => restaurarLinha(tx, inspirations, inspiracao))
  } catch {
    return { erro: "Não foi possível restaurar." }
  }

  revalidar()
  return {}
}
