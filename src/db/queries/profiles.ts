import { eq } from "drizzle-orm"
import { cache } from "react"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { profiles } from "@/db/schema"
import { createClient } from "@/lib/supabase/server"

/**
 * Perfil da usuária logada — hoje usado só pra saber `tipoConta` (decide se
 * a conta cai no fluxo de 1 casamento ou no painel `/casamentos` de conta
 * cerimonialista). Memoizada por requisição (`React.cache`).
 */
export const getMeuPerfil = cache(async function getMeuPerfil() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) => tx.query.profiles.findFirst({ where: eq(profiles.id, user.id) }))
})
