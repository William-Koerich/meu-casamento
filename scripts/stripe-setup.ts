/**
 * Cria (uma vez só) os produtos/preços no Stripe usados pelo checkout —
 * plano único da noiva (pagamento único) e os 3 planos mensais da
 * cerimonialista (assinatura). Idempotente via `lookup_key`: rodar de novo
 * não duplica, só imprime os IDs já existentes.
 *
 * Uso: npx tsx scripts/stripe-setup.ts
 * Depois: copiar os price IDs impressos pro .env.local (e pra Vercel).
 */
import "@/db/load-env"
import Stripe from "stripe"

import { PRECO_MENSAL_POR_PLANO, PRECO_NOIVA } from "@/lib/planos"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function precoUnico(lookupKey: string, nomeProduto: string, valorReais: number) {
  const existentes = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 })
  if (existentes.data[0]) return existentes.data[0]

  const produto = await stripe.products.create({ name: nomeProduto })
  return stripe.prices.create({
    product: produto.id,
    currency: "brl",
    unit_amount: Math.round(valorReais * 100),
    lookup_key: lookupKey,
  })
}

async function precoMensal(lookupKey: string, nomeProduto: string, valorReais: number) {
  const existentes = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 })
  if (existentes.data[0]) return existentes.data[0]

  const produto = await stripe.products.create({ name: nomeProduto })
  return stripe.prices.create({
    product: produto.id,
    currency: "brl",
    unit_amount: Math.round(valorReais * 100),
    recurring: { interval: "month" },
    lookup_key: lookupKey,
  })
}

async function main() {
  const noiva = await precoUnico(
    "noiva_unico",
    "Meu Casamento — Plano Único",
    PRECO_NOIVA
  )
  const basico = await precoMensal(
    "cerimonialista_basico",
    "Meu Casamento — Cerimonialista Básico",
    PRECO_MENSAL_POR_PLANO.basico
  )
  const premium = await precoMensal(
    "cerimonialista_premium",
    "Meu Casamento — Cerimonialista Premium",
    PRECO_MENSAL_POR_PLANO.premium
  )
  const platinum = await precoMensal(
    "cerimonialista_platinum",
    "Meu Casamento — Cerimonialista Platinum",
    PRECO_MENSAL_POR_PLANO.platinum
  )

  console.log("\nCole isto no .env.local (e nas env vars da Vercel):\n")
  console.log(`STRIPE_PRICE_NOIVA=${noiva.id}`)
  console.log(`STRIPE_PRICE_CERIMONIALISTA_BASICO=${basico.id}`)
  console.log(`STRIPE_PRICE_CERIMONIALISTA_PREMIUM=${premium.id}`)
  console.log(`STRIPE_PRICE_CERIMONIALISTA_PLATINUM=${platinum.id}`)
}

main()
