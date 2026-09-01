"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { guestPhotos } from "@/db/schema"

type ResultadoAction = { erro: string } | { erro?: undefined }

export async function excluirFotoConvidado(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(guestPhotos).where(eq(guestPhotos.id, id)))
  } catch {
    return { erro: "Não foi possível excluir a foto." }
  }

  revalidatePath("/app/fotos-convidados")
  return {}
}
