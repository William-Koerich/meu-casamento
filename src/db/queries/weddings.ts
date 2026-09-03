import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { cache } from "react"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { weddings } from "@/db/schema"
import { COOKIE_CASAMENTO_ATIVO } from "@/lib/casamento-ativo"
import { createClient } from "@/lib/supabase/server"

export { onboardingConcluido } from "@/lib/wedding-status"

/**
 * Retorna o casamento "atual" da sessão: o do cookie `casamento_ativo` (só
 * relevante pra conta cerimonialista, com vários casamentos — ver
 * `getMeusCasamentos`), com fallback pro casamento mais antigo visível à
 * usuária logada. Para conta noiva (o caso comum, 1 casamento só) o fallback
 * já resolve certo mesmo sem cookie nenhum. Memoizada por requisição
 * (`React.cache`) — layout, página e componentes do dashboard chamam essa
 * função sem se preocupar em buscar o dado mais de uma vez.
 */
export const getMinhaWedding = cache(async function getMinhaWedding() {
  const { rls } = await createDrizzleSupabaseClient()
  const cookieStore = await cookies()
  const idAtivo = cookieStore.get(COOKIE_CASAMENTO_ATIVO)?.value

  return rls(async (tx) => {
    if (idAtivo) {
      const casamento = await tx.query.weddings.findFirst({
        where: eq(weddings.id, idAtivo),
      })
      // RLS já garante que só volta aqui se a usuária puder ver essa linha —
      // um cookie adulterado/de casamento antigo (revogado, de outra conta)
      // simplesmente não bate com nada e cai no fallback abaixo.
      if (casamento) return casamento
    }
    return tx.query.weddings.findFirst({ orderBy: weddings.createdAt })
  })
})

/**
 * Todos os casamentos que a usuária logada cadastrou (dona) — usada pelo
 * painel `/casamentos` da conta cerimonialista. Conta noiva nunca precisa
 * disso (tem no máximo 1), mas a função não distingue tipo de conta: quem
 * chama decide se mostra a lista ou não.
 */
export const getMeusCasamentos = cache(async function getMeusCasamentos() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.weddings.findMany({
      where: eq(weddings.ownerId, user.id),
      orderBy: (w, { desc }) => desc(w.createdAt),
    })
  )
})
