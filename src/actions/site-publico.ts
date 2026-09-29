"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { weddings } from "@/db/schema"

type ResultadoAction = { erro: string } | { erro?: undefined }

// A página pública (/c/[slug]) não entra aqui de propósito: como toda
// rota que passa por rls() ela já é dinâmica (lê cookies via createClient()),
// não fica no Full Route Cache — mesmo padrão de atualizarFotoCapa/
// atualizarSlug/alternarPublicado em actions/settings.ts.
function revalidar() {
  revalidatePath("/app/site-publico")
}

export async function atualizarModoPaginaMarkdown(
  ativo: boolean
): Promise<ResultadoAction> {
  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(weddings)
        .set({ paginaMarkdownAtiva: ativo })
        .where(eq(weddings.id, wedding.id))
    )
  } catch {
    return { erro: "Não foi possível atualizar." }
  }

  revalidar()
  return {}
}

// Sem `revalidatePath` de propósito, mesmo motivo já documentado em
// `atualizarConteudoAnotacao` (Fase 20): o editor salva com debounce a cada
// pausa de digitação, e a prévia já renderiza a partir do estado local do
// textarea — revalidar a rota inteira nesse ritmo derrubaria o foco/cursor
// sem nenhum ganho (só a página pública em /c/[slug] lê esse dado de
// verdade, e ela já é dinâmica a cada request).
export async function atualizarPaginaMarkdown(
  conteudo: string
): Promise<ResultadoAction> {
  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(weddings)
        .set({ paginaMarkdown: conteudo })
        .where(eq(weddings.id, wedding.id))
    )
  } catch {
    return { erro: "Não foi possível salvar." }
  }

  return {}
}

export async function atualizarFundoPaginaMarkdown(
  url: string | null
): Promise<ResultadoAction> {
  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.update(weddings).set({ paginaFundoUrl: url }).where(eq(weddings.id, wedding.id))
    )
  } catch {
    return { erro: "Não foi possível salvar o fundo." }
  }

  revalidar()
  return {}
}
