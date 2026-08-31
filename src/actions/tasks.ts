"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { tasks } from "@/db/schema"
import { getMinhaWedding } from "@/db/queries/weddings"
import { tarefaSchema } from "@/lib/validators/tasks"

type ResultadoAction = { erro: string } | { erro?: undefined }

function revalidarChecklist() {
  revalidatePath("/app/checklist")
  revalidatePath("/app")
}

export async function criarTarefa(input: unknown): Promise<ResultadoAction> {
  const dados = tarefaSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.insert(tasks).values({
        weddingId: wedding.id,
        titulo: dados.data.titulo,
        descricao: dados.data.descricao || null,
        categoria: dados.data.categoria as (typeof tasks.$inferInsert)["categoria"],
        prazo: dados.data.prazo || null,
        responsavelId: dados.data.responsavelId || null,
        origem: "manual",
      })
    )
  } catch {
    return { erro: "Não foi possível criar a tarefa." }
  }

  revalidarChecklist()
  return {}
}

export async function atualizarTarefa(
  id: string,
  input: unknown
): Promise<ResultadoAction> {
  const dados = tarefaSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(tasks)
        .set({
          titulo: dados.data.titulo,
          descricao: dados.data.descricao || null,
          categoria: dados.data.categoria as (typeof tasks.$inferInsert)["categoria"],
          prazo: dados.data.prazo || null,
          responsavelId: dados.data.responsavelId || null,
        })
        .where(eq(tasks.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar a tarefa." }
  }

  revalidarChecklist()
  return {}
}

export async function excluirTarefa(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(tasks).where(eq(tasks.id, id)))
  } catch {
    return { erro: "Não foi possível excluir a tarefa." }
  }

  revalidarChecklist()
  return {}
}

export async function alternarConclusao(
  id: string,
  concluida: boolean
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(tasks)
        .set({ concluida, concluidaEm: concluida ? new Date() : null })
        .where(eq(tasks.id, id))
    )
  } catch {
    return { erro: "Não foi possível atualizar a tarefa." }
  }

  revalidarChecklist()
  return {}
}
