import { createDrizzleSupabaseClient } from "@/db/rls"
import { weddings } from "@/db/schema"

/**
 * Retorna o casamento visível para a usuária logada (dona ou membro aceito).
 * Neste produto cada usuária participa de um único casamento, então o
 * primeiro resultado já é o que importa.
 */
export async function getMinhaWedding() {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) => tx.query.weddings.findFirst({ orderBy: weddings.createdAt }))
}

/**
 * Onboarding é considerado concluído quando o último passo do wizard
 * (escolha de estilo) foi salvo — evita uma coluna extra só para marcar
 * "rascunho x concluído".
 */
export function onboardingConcluido(
  wedding: { estilo: string | null } | undefined | null
) {
  return Boolean(wedding?.estilo)
}
