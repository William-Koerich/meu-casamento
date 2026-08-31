"use server"

import { asc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient, type Transaction } from "@/db/rls"
import { timelineEvents } from "@/db/schema"
import { somarMinutos } from "@/lib/time"
import { eventoSchema } from "@/lib/validators/timeline"

type ResultadoAction = { erro: string } | { erro?: undefined }

function revalidarCronograma() {
  revalidatePath("/app/cronograma")
}

async function recalcularHorarios(tx: Transaction) {
  const eventos = await tx
    .select({
      id: timelineEvents.id,
      horario: timelineEvents.horario,
      duracaoMinutos: timelineEvents.duracaoMinutos,
    })
    .from(timelineEvents)
    .orderBy(asc(timelineEvents.ordem))

  if (eventos.length === 0) return

  let horarioAtual = eventos[0].horario
  for (const [indice, evento] of eventos.entries()) {
    if (indice === 0) {
      horarioAtual = evento.horario
      continue
    }
    await tx
      .update(timelineEvents)
      .set({ horario: horarioAtual })
      .where(eq(timelineEvents.id, evento.id))
    horarioAtual = somarMinutos(horarioAtual, evento.duracaoMinutos)
  }
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
        .select({
          ordem: timelineEvents.ordem,
          horario: timelineEvents.horario,
          duracaoMinutos: timelineEvents.duracaoMinutos,
        })
        .from(timelineEvents)
        .where(eq(timelineEvents.weddingId, wedding.id))
        .orderBy(asc(timelineEvents.ordem))

      const ultimo = existentes.at(-1)
      const ordem = existentes.length
      const horario = ultimo
        ? somarMinutos(ultimo.horario, ultimo.duracaoMinutos)
        : dados.data.horario || "08:00:00"

      await tx.insert(timelineEvents).values({
        weddingId: wedding.id,
        titulo: dados.data.titulo,
        descricao: dados.data.descricao || null,
        responsavel: dados.data.responsavel || null,
        local: dados.data.local || null,
        duracaoMinutos: dados.data.duracaoMinutos,
        horario,
        ordem,
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
  input: unknown,
  ehPrimeiro: boolean
): Promise<ResultadoAction> {
  const dados = eventoSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      await tx
        .update(timelineEvents)
        .set({
          titulo: dados.data.titulo,
          descricao: dados.data.descricao || null,
          responsavel: dados.data.responsavel || null,
          local: dados.data.local || null,
          duracaoMinutos: dados.data.duracaoMinutos,
          ...(ehPrimeiro && dados.data.horario
            ? { horario: `${dados.data.horario}:00` }
            : {}),
        })
        .where(eq(timelineEvents.id, id))

      await recalcularHorarios(tx)
    })
  } catch {
    return { erro: "Não foi possível salvar o bloco." }
  }

  revalidarCronograma()
  return {}
}

export async function excluirEvento(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      await tx.delete(timelineEvents).where(eq(timelineEvents.id, id))
      await recalcularHorarios(tx)
    })
  } catch {
    return { erro: "Não foi possível excluir o bloco." }
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
      await recalcularHorarios(tx)
    })
  } catch {
    return { erro: "Não foi possível reordenar." }
  }

  revalidarCronograma()
  return {}
}
