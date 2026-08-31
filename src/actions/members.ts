"use server"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { weddingMembers } from "@/db/schema"
import { createClient } from "@/lib/supabase/server"
import { convidarMembroSchema } from "@/lib/validators/members"

type ResultadoAction = { erro: string } | { erro?: undefined }

function revalidarEquipe() {
  revalidatePath("/app/equipe")
}

export async function convidarMembro(input: unknown): Promise<ResultadoAction> {
  const dados = convidarMembroSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.insert(weddingMembers).values({
        weddingId: wedding.id,
        papel: dados.data.papel as (typeof weddingMembers.$inferInsert)["papel"],
        permissao: dados.data
          .permissao as (typeof weddingMembers.$inferInsert)["permissao"],
        conviteEmail: dados.data.email,
        conviteToken: crypto.randomUUID(),
      })
    )
  } catch {
    return { erro: "Não foi possível enviar o convite. Você precisa ser administradora." }
  }

  revalidarEquipe()
  return {}
}

export async function atualizarPermissaoMembro(
  id: string,
  permissao: (typeof weddingMembers.$inferInsert)["permissao"]
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.update(weddingMembers).set({ permissao }).where(eq(weddingMembers.id, id))
    )
  } catch {
    return { erro: "Não foi possível atualizar a permissão." }
  }

  revalidarEquipe()
  return {}
}

export async function revogarMembro(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(weddingMembers).where(eq(weddingMembers.id, id)))
  } catch {
    return { erro: "Não foi possível revogar o acesso." }
  }

  revalidarEquipe()
  return {}
}

export async function aceitarConvite(token: string): Promise<ResultadoAction> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { erro: "Entre ou crie uma conta para aceitar o convite." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    const linhas = await rls(
      (tx) =>
        tx
          .update(weddingMembers)
          .set({ userId: user.id, conviteAceitoEm: new Date() })
          .where(eq(weddingMembers.conviteToken, token))
          .returning({ id: weddingMembers.id }),
      { inviteToken: token }
    )
    if (linhas.length === 0) return { erro: "Convite inválido ou já aceito." }
  } catch {
    return { erro: "Não foi possível aceitar o convite." }
  }

  redirect("/app")
}
