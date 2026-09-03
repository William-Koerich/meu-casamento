import Stripe from "stripe"

// Chave secreta — só usada em Server Actions e no webhook (route handler),
// nunca em Client Component. Modo teste enquanto o CNPJ não sai (ver
// CLAUDE.md > "Fase 14 — Pagamentos via Stripe").
//
// Lazy de propósito (mesmo motivo de supabaseEnv() em
// src/lib/supabase/env.ts): `new Stripe(...)` no topo do módulo já lança se
// STRIPE_SECRET_KEY não existir, e o Next importa este arquivo ao coletar
// dados de página em build ("Failed to collect page data for
// /api/stripe/webhook") — derrubando o build inteiro na Vercel antes mesmo
// de qualquer rota rodar, mesmo que a variável só falte num ambiente sem
// nenhuma intenção de usar Stripe ainda (preview, por exemplo).
let instancia: Stripe | null = null

export function getStripe(): Stripe {
  if (!instancia) {
    const chave = process.env.STRIPE_SECRET_KEY
    if (!chave) {
      throw new Error(
        "STRIPE_SECRET_KEY não está definida. Confira as variáveis de ambiente " +
          "(na Vercel: Settings > Environment Variables, no ambiente correto)."
      )
    }
    instancia = new Stripe(chave)
  }
  return instancia
}
