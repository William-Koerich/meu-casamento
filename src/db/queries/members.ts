import { and, eq, isNotNull } from "drizzle-orm"
import { cache } from "react"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { weddingMembers, weddings } from "@/db/schema"

export type MembroAtribuivel = { id: string; nome: string }

/**
 * Pessoas às quais dá para atribuir uma tarefa: a dona do casamento e os
 * membros da equipe que já aceitaram o convite (têm `user_id` e perfil).
 */
export const getMembrosAtribuiveis = cache(async function getMembrosAtribuiveis(
  weddingId: string
): Promise<MembroAtribuivel[]> {
  const { rls } = await createDrizzleSupabaseClient()

  return rls(async (tx) => {
    const wedding = await tx.query.weddings.findFirst({
      where: eq(weddings.id, weddingId),
      with: { owner: true },
    })
    if (!wedding) return []

    const membros = await tx.query.weddingMembers.findMany({
      where: and(
        eq(weddingMembers.weddingId, weddingId),
        isNotNull(weddingMembers.userId)
      ),
      with: { profile: true },
    })

    const lista: MembroAtribuivel[] = []
    if (wedding.owner) lista.push({ id: wedding.owner.id, nome: wedding.owner.nome })
    for (const membro of membros) {
      if (membro.profile) lista.push({ id: membro.profile.id, nome: membro.profile.nome })
    }
    return lista
  })
})

export async function getEquipe(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.weddingMembers.findMany({
      where: eq(weddingMembers.weddingId, weddingId),
      with: { profile: true },
      orderBy: (membros, { asc }) => asc(membros.createdAt),
    })
  )
}

export type MembroEquipe = Awaited<ReturnType<typeof getEquipe>>[number]

export async function getConvitePorToken(token: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls(
    (tx) =>
      tx.query.weddingMembers.findFirst({
        where: eq(weddingMembers.conviteToken, token),
        with: { wedding: true },
      }),
    { inviteToken: token }
  )
}
