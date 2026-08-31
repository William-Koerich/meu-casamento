"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { guests, tables } from "@/db/schema"
import { mesaSchema } from "@/lib/validators/tables"

type ResultadoAction = { erro: string } | { erro?: undefined; id?: string }

function revalidarMesas() {
  revalidatePath("/app/convidados/mesas")
  revalidatePath("/app/convidados")
}

export async function criarMesa(input: unknown): Promise<ResultadoAction> {
  const dados = mesaSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    const [criada] = await rls((tx) =>
      tx
        .insert(tables)
        .values({
          weddingId: wedding.id,
          nome: dados.data.nome,
          capacidade: dados.data.capacidade,
          formato: dados.data.formato as (typeof tables.$inferInsert)["formato"],
          posX: String(24 + Math.random() * 200),
          posY: String(24 + Math.random() * 120),
        })
        .returning({ id: tables.id })
    )
    revalidarMesas()
    return { id: criada?.id }
  } catch {
    return { erro: "Não foi possível criar a mesa." }
  }
}

export async function atualizarMesa(
  id: string,
  input: unknown
): Promise<ResultadoAction> {
  const dados = mesaSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(tables)
        .set({
          nome: dados.data.nome,
          capacidade: dados.data.capacidade,
          formato: dados.data.formato as (typeof tables.$inferInsert)["formato"],
        })
        .where(eq(tables.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar a mesa." }
  }
  revalidarMesas()
  return {}
}

export async function atualizarPosicaoMesa(
  id: string,
  posX: number,
  posY: number
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(tables)
        .set({ posX: String(posX), posY: String(posY) })
        .where(eq(tables.id, id))
    )
  } catch {
    return { erro: "Não foi possível mover a mesa." }
  }
  revalidatePath("/app/convidados/mesas")
  return {}
}

export async function excluirMesa(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(tables).where(eq(tables.id, id)))
  } catch {
    return { erro: "Não foi possível excluir a mesa." }
  }
  revalidarMesas()
  return {}
}

export async function atribuirConvidadoMesa(
  guestId: string,
  tableId: string | null
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.update(guests).set({ tableId }).where(eq(guests.id, guestId)))
  } catch {
    return { erro: "Não foi possível atribuir o convidado." }
  }
  revalidarMesas()
  return {}
}
