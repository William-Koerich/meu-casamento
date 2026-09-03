import type { planoCerimonialistaEnum } from "@/db/schema"

type PlanoCerimonialista = (typeof planoCerimonialistaEnum.enumValues)[number]

// Fonte única de preço/limite dos planos — usada tanto pela página de
// preços (marketing) quanto pela checagem real em criarCasamento (Server
// Action). Valores fictícios (mesmo espírito do preço único da noiva, ver
// CLAUDE.md > "Preço é placeholder"): ainda não existe cobrança de verdade
// (Stripe), plano da conta é setado manualmente até isso existir.
export const PRECO_NOIVA = 149

export const LIMITE_CASAMENTOS_POR_PLANO: Record<PlanoCerimonialista, number | null> = {
  basico: 5,
  premium: 15,
  platinum: null, // null = sem limite
}

export const PRECO_MENSAL_POR_PLANO: Record<PlanoCerimonialista, number> = {
  basico: 49.9,
  premium: 99.9,
  platinum: 179.9,
}

/** null = sem limite (plano platinum). */
export function limiteAtingido(
  plano: PlanoCerimonialista | null | undefined,
  quantidadeAtual: number
): boolean {
  if (!plano) return false
  const limite = LIMITE_CASAMENTOS_POR_PLANO[plano]
  return limite !== null && quantidadeAtual >= limite
}
