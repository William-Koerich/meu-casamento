"use server"

import { count, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { songs } from "@/db/schema"
import { musicaSchema } from "@/lib/validators/songs"

type ResultadoAction = { erro: string } | { erro?: undefined }

function revalidar() {
  revalidatePath("/app/playlist")
}

export async function criarMusica(input: unknown): Promise<ResultadoAction> {
  const dados = musicaSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const [{ total }] = await tx
        .select({ total: count() })
        .from(songs)
        .where(eq(songs.weddingId, wedding.id))

      await tx.insert(songs).values({
        weddingId: wedding.id,
        titulo: dados.data.titulo,
        artista: dados.data.artista || null,
        momento: dados.data.momento as (typeof songs.$inferInsert)["momento"],
        spotifyUrl: dados.data.spotifyUrl || null,
        ordem: total,
      })
    })
  } catch {
    return { erro: "Não foi possível salvar a música." }
  }

  revalidar()
  return {}
}

export async function atualizarMusica(
  id: string,
  input: unknown
): Promise<ResultadoAction> {
  const dados = musicaSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(songs)
        .set({
          titulo: dados.data.titulo,
          artista: dados.data.artista || null,
          momento: dados.data.momento as (typeof songs.$inferInsert)["momento"],
          spotifyUrl: dados.data.spotifyUrl || null,
        })
        .where(eq(songs.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar a música." }
  }

  revalidar()
  return {}
}

export async function excluirMusica(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(songs).where(eq(songs.id, id)))
  } catch {
    return { erro: "Não foi possível excluir a música." }
  }

  revalidar()
  return {}
}

export async function reordenarMusicas(idsEmOrdem: string[]): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      for (const [indice, id] of idsEmOrdem.entries()) {
        await tx.update(songs).set({ ordem: indice }).where(eq(songs.id, id))
      }
    })
  } catch {
    return { erro: "Não foi possível reordenar." }
  }

  revalidar()
  return {}
}
