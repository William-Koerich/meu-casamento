"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import {
  excluirComRetorno,
  restaurarLinha,
  type ResultadoExclusao,
} from "@/db/delete-helpers"
import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { timelineEvents } from "@/db/schema"
import { eventoSchema } from "@/lib/validators/timeline"

type ResultadoAction = { erro: string } | { erro?: undefined }
type Evento = typeof timelineEvents.$inferSelect

function revalidarCronograma() {
  revalidatePath("/app/cronograma")
}

export async function criarEvento(input: unknown): Promise<ResultadoAction> {
  const dados = eventoSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const existentes = await tx
        .select({ ordem: timelineEvents.ordem })
        .from(timelineEvents)
        .where(eq(timelineEvents.weddingId, wedding.id))

      await tx.insert(timelineEvents).values({
        weddingId: wedding.id,
        titulo: dados.data.titulo,
        descricao: dados.data.descricao || null,
        responsavel: dados.data.responsavel || null,
        local: dados.data.local || null,
        duracaoMinutos: dados.data.duracaoMinutos,
        horario: `${dados.data.horario}:00`,
        ordem: existentes.length,
      })
    })
  } catch {
    return { erro: "Não foi possível criar o bloco." }
  }

  revalidarCronograma()
  return {}
}

export async function atualizarEvento(
  id: string,
  input: unknown
): Promise<ResultadoAction> {
  const dados = eventoSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(timelineEvents)
        .set({
          titulo: dados.data.titulo,
          descricao: dados.data.descricao || null,
          responsavel: dados.data.responsavel || null,
          local: dados.data.local || null,
          duracaoMinutos: dados.data.duracaoMinutos,
          horario: `${dados.data.horario}:00`,
        })
        .where(eq(timelineEvents.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar o bloco." }
  }

  revalidarCronograma()
  return {}
}

export async function excluirEvento(id: string): Promise<ResultadoExclusao<Evento>> {
  const { rls } = await createDrizzleSupabaseClient()
  let linha: Evento | null
  try {
    linha = await rls((tx) =>
      excluirComRetorno(tx, timelineEvents, timelineEvents.id, id)
    )
  } catch {
    return { erro: "Não foi possível excluir o bloco." }
  }
  if (!linha) return { erro: "Bloco não encontrado." }

  revalidarCronograma()
  return { linha }
}

export async function restaurarEvento(evento: Evento): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => restaurarLinha(tx, timelineEvents, evento))
  } catch {
    return { erro: "Não foi possível restaurar o bloco." }
  }

  revalidarCronograma()
  return {}
}

export async function reordenarEventos(idsEmOrdem: string[]): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      for (const [indice, id] of idsEmOrdem.entries()) {
        await tx
          .update(timelineEvents)
          .set({ ordem: indice })
          .where(eq(timelineEvents.id, id))
      }
    })
  } catch {
    return { erro: "Não foi possível reordenar." }
  }

  revalidarCronograma()
  return {}
}
