// Função pura (sem import de servidor) pra poder ser usada tanto em queries
// server-only (src/db/queries/weddings.ts) quanto em Client Components (ex.:
// casamento-card.tsx, no painel da cerimonialista) sem puxar "next/headers"
// pro bundle do cliente.

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
