"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { honeymoon, type ChecklistMalaItem } from "@/db/schema"
import { honeymoonDadosSchema, roteiroDiaSchema } from "@/lib/validators/honeymoon"

type ResultadoAction = { erro: string } | { erro?: undefined }

function revalidar() {
  revalidatePath("/app/lua-de-mel")
}

export async function salvarDadosGerais(input: unknown): Promise<ResultadoAction> {
  const dados = honeymoonDadosSchema.safeParse(input)
  if (!dados.success) return { erro: "Dados inválidos." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .insert(honeymoon)
        .values({
          weddingId: wedding.id,
          destino: dados.data.destino || null,
          dataIda: dados.data.dataIda || null,
          dataVolta: dados.data.dataVolta || null,
          orcamento: dados.data.orcamento != null ? String(dados.data.orcamento) : null,
          notas: dados.data.notas || null,
        })
        .onConflictDoUpdate({
          target: honeymoon.weddingId,
          set: {
            destino: dados.data.destino || null,
            dataIda: dados.data.dataIda || null,
            dataVolta: dados.data.dataVolta || null,
            orcamento: dados.data.orcamento != null ? String(dados.data.orcamento) : null,
            notas: dados.data.notas || null,
          },
        })
    )
  } catch {
    return { erro: "Não foi possível salvar." }
  }

  revalidar()
  return {}
}

async function garantirLinha(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  await rls((tx) =>
    tx
      .insert(honeymoon)
      .values({ weddingId })
      .onConflictDoNothing({ target: honeymoon.weddingId })
  )
}

export async function adicionarDiaRoteiro(input: unknown): Promise<ResultadoAction> {
  const dados = roteiroDiaSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  await garantirLinha(wedding.id)

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const atual = await tx.query.honeymoon.findFirst({
        where: eq(honeymoon.weddingId, wedding.id),
      })
      const roteiro = [
        ...(atual?.roteiro ?? []),
        { ...dados.data, atividades: dados.data.atividades ?? "" },
      ]
      await tx
        .update(honeymoon)
        .set({ roteiro })
        .where(eq(honeymoon.weddingId, wedding.id))
    })
  } catch {
    return { erro: "Não foi possível salvar o dia." }
  }

  revalidar()
  return {}
}

export async function removerDiaRoteiro(indice: number): Promise<ResultadoAction> {
  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const atual = await tx.query.honeymoon.findFirst({
        where: eq(honeymoon.weddingId, wedding.id),
      })
      const roteiro = (atual?.roteiro ?? []).filter((_, i) => i !== indice)
      await tx
        .update(honeymoon)
        .set({ roteiro })
        .where(eq(honeymoon.weddingId, wedding.id))
    })
  } catch {
    return { erro: "Não foi possível remover o dia." }
  }

  revalidar()
  return {}
}

export async function adicionarItemMala(item: string): Promise<ResultadoAction> {
  if (!item.trim()) return { erro: "Informe o item." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  await garantirLinha(wedding.id)

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const atual = await tx.query.honeymoon.findFirst({
        where: eq(honeymoon.weddingId, wedding.id),
      })
      const checklistMala: ChecklistMalaItem[] = [
        ...(atual?.checklistMala ?? []),
        { item: item.trim(), marcado: false },
      ]
      await tx
        .update(honeymoon)
        .set({ checklistMala })
        .where(eq(honeymoon.weddingId, wedding.id))
    })
  } catch {
    return { erro: "Não foi possível adicionar o item." }
  }

  revalidar()
  return {}
}

export async function alternarItemMala(
  indice: number,
  marcado: boolean
): Promise<ResultadoAction> {
  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const atual = await tx.query.honeymoon.findFirst({
        where: eq(honeymoon.weddingId, wedding.id),
      })
      const checklistMala = (atual?.checklistMala ?? []).map((item, i) =>
        i === indice ? { ...item, marcado } : item
      )
      await tx
        .update(honeymoon)
        .set({ checklistMala })
        .where(eq(honeymoon.weddingId, wedding.id))
    })
  } catch {
    return { erro: "Não foi possível atualizar o item." }
  }

  revalidar()
  return {}
}

export async function removerItemMala(indice: number): Promise<ResultadoAction> {
  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const atual = await tx.query.honeymoon.findFirst({
        where: eq(honeymoon.weddingId, wedding.id),
      })
      const checklistMala = (atual?.checklistMala ?? []).filter((_, i) => i !== indice)
      await tx
        .update(honeymoon)
        .set({ checklistMala })
        .where(eq(honeymoon.weddingId, wedding.id))
    })
  } catch {
    return { erro: "Não foi possível remover o item." }
  }

  revalidar()
  return {}
}
