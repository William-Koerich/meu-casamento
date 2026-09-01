"use server"

import { count, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { pageBlocks, type BlockConfig } from "@/db/schema"
import { textoBlocoSchema } from "@/lib/validators/page-blocks"

type ResultadoAction = { erro: string } | { erro?: undefined }

// A página pública (/c/[slug]) não entra aqui de propósito: como toda
// rota que passa por rls() ela já é dinâmica (lê cookies via createClient()),
// não fica no Full Route Cache — mesmo padrão de atualizarFotoCapa/
// atualizarSlug/alternarPublicado em actions/settings.ts.
function revalidar() {
  revalidatePath("/app/site-publico")
}

// As 4 seções fixas do site nascem na primeira visita ao construtor —
// idempotente (só insere se ainda não existir nenhum bloco), então não
// precisa de migration de backfill pros casamentos já publicados antes
// dessa funcionalidade existir.
export async function garantirBlocosPadrao(): Promise<ResultadoAction> {
  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const [{ total }] = await tx
        .select({ total: count() })
        .from(pageBlocks)
        .where(eq(pageBlocks.weddingId, wedding.id))
      if (total > 0) return

      const padrao: (typeof pageBlocks.$inferInsert)["tipo"][] = [
        "historia",
        "nav_rsvp",
        "nav_presentes",
        "nav_local",
      ]
      await tx
        .insert(pageBlocks)
        .values(padrao.map((tipo, ordem) => ({ weddingId: wedding.id, tipo, ordem })))
    })
  } catch {
    return { erro: "Não foi possível preparar a página." }
  }

  return {}
}

type TipoAdicionavel = "foto" | "galeria" | "texto"

export async function adicionarBloco(
  tipo: TipoAdicionavel,
  config: BlockConfig
): Promise<ResultadoAction> {
  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const [{ total }] = await tx
        .select({ total: count() })
        .from(pageBlocks)
        .where(eq(pageBlocks.weddingId, wedding.id))
      await tx.insert(pageBlocks).values({
        weddingId: wedding.id,
        tipo,
        ordem: total,
        config,
      })
    })
  } catch {
    return { erro: "Não foi possível adicionar o bloco." }
  }

  revalidar()
  return {}
}

export async function adicionarBlocoTexto(input: unknown): Promise<ResultadoAction> {
  const dados = textoBlocoSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha o texto do bloco." }
  return adicionarBloco("texto", {
    titulo: dados.data.titulo ?? "",
    corpo: dados.data.corpo,
  })
}

export async function atualizarBlocoTexto(
  id: string,
  input: unknown
): Promise<ResultadoAction> {
  const dados = textoBlocoSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha o texto do bloco." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(pageBlocks)
        .set({ config: { titulo: dados.data.titulo ?? "", corpo: dados.data.corpo } })
        .where(eq(pageBlocks.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar o texto." }
  }

  revalidar()
  return {}
}

export async function atualizarConfigBloco(
  id: string,
  config: BlockConfig
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.update(pageBlocks).set({ config }).where(eq(pageBlocks.id, id)))
  } catch {
    return { erro: "Não foi possível salvar o bloco." }
  }

  revalidar()
  return {}
}

export async function alternarVisibilidadeBloco(
  id: string,
  visivel: boolean
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.update(pageBlocks).set({ visivel }).where(eq(pageBlocks.id, id)))
  } catch {
    return { erro: "Não foi possível atualizar." }
  }

  revalidar()
  return {}
}

export async function removerBloco(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(pageBlocks).where(eq(pageBlocks.id, id)))
  } catch {
    return { erro: "Não foi possível remover o bloco." }
  }

  revalidar()
  return {}
}

export async function reordenarBlocos(idsEmOrdem: string[]): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      for (const [indice, id] of idsEmOrdem.entries()) {
        await tx.update(pageBlocks).set({ ordem: indice }).where(eq(pageBlocks.id, id))
      }
    })
  } catch {
    return { erro: "Não foi possível reordenar." }
  }

  revalidar()
  return {}
}
