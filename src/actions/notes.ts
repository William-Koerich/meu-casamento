"use server"

import { count, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { notes } from "@/db/schema"
import { notaConteudoSchema, notaCorSchema } from "@/lib/validators/notes"

type ResultadoAction = { erro: string } | { erro?: undefined }

function revalidar() {
  revalidatePath("/app/anotacoes")
}

// `.returning()` é seguro aqui: a policy de select de `notes` passa por
// `is_wedding_member`, que consulta `weddings`/`wedding_members` — nunca a
// própria `notes` — então não esbarra na pegadinha de RLS+RETURNING já
// documentada em CLAUDE.md (Fases 11/12) pra tabelas cuja policy reconsulta
// a si mesma. Confirmado com script à parte (rollback forçado, produção)
// antes de usar aqui.
export async function criarAnotacao(
  cor: unknown
): Promise<ResultadoAction & { nota?: typeof notes.$inferSelect }> {
  const corValidada = notaCorSchema.safeParse(cor)
  if (!corValidada.success) return { erro: "Cor inválida." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  let nota: typeof notes.$inferSelect | undefined
  try {
    await rls(async (tx) => {
      const [{ total }] = await tx
        .select({ total: count() })
        .from(notes)
        .where(eq(notes.weddingId, wedding.id))

      ;[nota] = await tx
        .insert(notes)
        .values({ weddingId: wedding.id, cor: corValidada.data, ordem: total })
        .returning()
    })
  } catch {
    return { erro: "Não foi possível criar a anotação." }
  }

  revalidar()
  return { nota }
}

export async function atualizarConteudoAnotacao(
  id: string,
  conteudo: unknown
): Promise<ResultadoAction> {
  const dados = notaConteudoSchema.safeParse(conteudo)
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Texto inválido." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.update(notes).set({ conteudo: dados.data }).where(eq(notes.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar a anotação." }
  }

  // Sem revalidatePath aqui de propósito: autosave a cada pausa de digitação
  // revalidando a rota inteira redesenharia todos os post-its e derrubaria o
  // foco/cursor de quem está digitando num deles. O conteúdo já está
  // salvo no banco; a próxima navegação normal já vem com o dado atual.
  return {}
}

export async function atualizarCorAnotacao(
  id: string,
  cor: unknown
): Promise<ResultadoAction> {
  const dados = notaCorSchema.safeParse(cor)
  if (!dados.success) return { erro: "Cor inválida." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.update(notes).set({ cor: dados.data }).where(eq(notes.id, id)))
  } catch {
    return { erro: "Não foi possível trocar a cor." }
  }

  revalidar()
  return {}
}

export async function excluirAnotacao(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(notes).where(eq(notes.id, id)))
  } catch {
    return { erro: "Não foi possível excluir a anotação." }
  }

  revalidar()
  return {}
}

export async function reordenarAnotacoes(idsEmOrdem: string[]): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      for (const [indice, id] of idsEmOrdem.entries()) {
        await tx.update(notes).set({ ordem: indice }).where(eq(notes.id, id))
      }
    })
  } catch {
    return { erro: "Não foi possível reordenar." }
  }

  revalidar()
  return {}
}
