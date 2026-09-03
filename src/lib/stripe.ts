import Stripe from "stripe"

// Chave secreta — só usada em Server Actions e no webhook (route handler),
// nunca em Client Component. Modo teste enquanto o CNPJ não sai (ver
// CLAUDE.md > "Fase 14 — Pagamentos via Stripe").
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
