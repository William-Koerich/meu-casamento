import type { planoCerimonialistaEnum } from "@/db/schema"

export type PlanoCerimonialista = (typeof planoCerimonialistaEnum.enumValues)[number]

// Fonte única de preço/limite dos planos — usada tanto pela página de
// preços (marketing) quanto pela checagem real em criarCasamento (Server
// Action) e pelo checkout do Stripe. Valores fictícios (ver CLAUDE.md >
// "Preço é placeholder"): ainda em modo teste do Stripe, sem CNPJ validado.
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

/**
 * null = sem limite (plano platinum) OU sem plano nenhum (chamador decide o
 * que fazer nesse caso — ver criarCasamento, que trata "sem plano" como
 * bloqueio total, não como "sem limite").
 */
export function limiteAtingido(
  plano: PlanoCerimonialista | null | undefined,
  quantidadeAtual: number
): boolean {
  if (!plano) return false
  const limite = LIMITE_CASAMENTOS_POR_PLANO[plano]
  return limite !== null && quantidadeAtual >= limite
}

/** Price IDs do Stripe (criados via `npm run stripe:setup`, ver scripts/stripe-setup.ts). */
export function precoStripeCerimonialista(plano: PlanoCerimonialista): string {
  const variavel = {
    basico: process.env.STRIPE_PRICE_CERIMONIALISTA_BASICO,
    premium: process.env.STRIPE_PRICE_CERIMONIALISTA_PREMIUM,
    platinum: process.env.STRIPE_PRICE_CERIMONIALISTA_PLATINUM,
  }[plano]
  if (!variavel)
    throw new Error(`Price do Stripe não configurado para o plano "${plano}".`)
  return variavel
}

export function precoStripeNoiva(): string {
  const variavel = process.env.STRIPE_PRICE_NOIVA
  if (!variavel) throw new Error('Price do Stripe não configurado para o plano "noiva".')
  return variavel
}
