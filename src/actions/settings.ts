"use server"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { weddings } from "@/db/schema"
import { createClient } from "@/lib/supabase/server"
import { configuracoesSchema, slugSchema } from "@/lib/validators/settings"

type ResultadoAction = { erro: string } | { erro?: undefined }

function revalidarConfiguracoes() {
  revalidatePath("/app/configuracoes")
  revalidatePath("/app")
}

function ehViolacaoDeSlugDuplicado(erro: unknown) {
  return Boolean(
    erro && typeof erro === "object" && "code" in erro && erro.code === "23505"
  )
}

export async function atualizarConfiguracoes(input: unknown): Promise<ResultadoAction> {
  const dados = configuracoesSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(weddings)
        .set({
          nomeNoiva: dados.data.nomeNoiva,
          nomeNoivo: dados.data.nomeNoivo,
          dataCasamento: dados.data.dataCasamento || null,
          horaCerimonia: dados.data.horaCerimonia
            ? `${dados.data.horaCerimonia}:00`
            : null,
          localCerimonia: dados.data.localCerimonia || null,
          enderecoCerimonia: dados.data.enderecoCerimonia || null,
          localFesta: dados.data.localFesta || null,
          enderecoFesta: dados.data.enderecoFesta || null,
          cidade: dados.data.cidade || null,
          estado: dados.data.estado || null,
          dressCode: dados.data.dressCode || null,
          historiaCasal: dados.data.historiaCasal || null,
        })
        .where(eq(weddings.id, wedding.id))
    )
  } catch {
    return { erro: "Não foi possível salvar. Você precisa ser administradora." }
  }

  revalidarConfiguracoes()
  return {}
}

export async function atualizarSlug(input: unknown): Promise<ResultadoAction> {
  const dados = slugSchema.safeParse(input)
  if (!dados.success)
    return { erro: dados.error.issues[0]?.message ?? "Endereço inválido." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(weddings)
        .set({ slug: dados.data.slug })
        .where(eq(weddings.id, wedding.id))
    )
  } catch (erro) {
    if (ehViolacaoDeSlugDuplicado(erro)) return { erro: "Esse endereço já está em uso." }
    return { erro: "Não foi possível salvar o endereço." }
  }

  revalidarConfiguracoes()
  return {}
}

export async function alternarPublicado(publicado: boolean): Promise<ResultadoAction> {
  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.update(weddings).set({ publicado }).where(eq(weddings.id, wedding.id))
    )
  } catch {
    return { erro: "Não foi possível atualizar. Você precisa ser administradora." }
  }

  revalidarConfiguracoes()
  return {}
}

export async function atualizarFotoCapa(fotoCapaUrl: string): Promise<ResultadoAction> {
  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.update(weddings).set({ fotoCapaUrl }).where(eq(weddings.id, wedding.id))
    )
  } catch {
    return { erro: "Não foi possível salvar a foto." }
  }

  revalidarConfiguracoes()
  return {}
}

export async function atualizarPosicaoFotoCapa(
  fotoCapaPosicaoX: number,
  fotoCapaPosicaoY: number
): Promise<ResultadoAction> {
  const x = Math.round(Math.min(100, Math.max(0, fotoCapaPosicaoX)))
  const y = Math.round(Math.min(100, Math.max(0, fotoCapaPosicaoY)))

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(weddings)
        .set({ fotoCapaPosicaoX: x, fotoCapaPosicaoY: y })
        .where(eq(weddings.id, wedding.id))
    )
  } catch {
    return { erro: "Não foi possível salvar a posição da foto." }
  }

  revalidarConfiguracoes()
  return {}
}

export async function excluirMinhaConta(): Promise<ResultadoAction> {
  const supabase = await createClient()
  const { error } = await supabase.rpc("excluir_minha_conta")

  if (error) return { erro: "Não foi possível excluir a conta." }

  await supabase.auth.signOut()
  redirect("/")
}
