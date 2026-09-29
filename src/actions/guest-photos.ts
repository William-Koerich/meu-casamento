"use server"

import { revalidatePath } from "next/cache"

import {
  excluirComRetorno,
  restaurarLinha,
  type ResultadoExclusao,
} from "@/db/delete-helpers"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { guestPhotos } from "@/db/schema"

type ResultadoAction = { erro: string } | { erro?: undefined }
type FotoConvidado = typeof guestPhotos.$inferSelect

export async function excluirFotoConvidado(
  id: string
): Promise<ResultadoExclusao<FotoConvidado>> {
  const { rls } = await createDrizzleSupabaseClient()
  let linha: FotoConvidado | null
  try {
    linha = await rls((tx) => excluirComRetorno(tx, guestPhotos, guestPhotos.id, id))
  } catch {
    return { erro: "Não foi possível excluir a foto." }
  }
  if (!linha) return { erro: "Foto não encontrada." }

  revalidatePath("/app/fotos-convidados")
  return { linha }
}

export async function restaurarFotoConvidado(
  foto: FotoConvidado
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => restaurarLinha(tx, guestPhotos, foto))
  } catch {
    return { erro: "Não foi possível restaurar a foto." }
  }

  revalidatePath("/app/fotos-convidados")
  return {}
}
