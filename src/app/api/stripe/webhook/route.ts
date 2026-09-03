import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { db } from "@/db"
import { profiles, weddings } from "@/db/schema"
import type { PlanoCerimonialista } from "@/lib/planos"
import { stripe } from "@/lib/stripe"

export const runtime = "nodejs"

const PLANOS_VALIDOS = ["basico", "premium", "platinum"] as const

function ehPlanoValido(valor: string | undefined): valor is PlanoCerimonialista {
  return PLANOS_VALIDOS.includes(valor as PlanoCerimonialista)
}

/**
 * Sem sessão de usuária (é o Stripe chamando, não uma pessoa logada) — não
 * dá pra passar por `rls()`. Autenticidade vem só da assinatura HMAC do
 * corpo (`stripe-signature`), verificada por `stripe.webhooks.constructEvent`
 * antes de qualquer escrita. Por isso as escritas usam o client
 * administrativo (`db`) — ver comentário em src/db/index.ts.
 */
export async function POST(request: Request) {
  const corpo = await request.text()
  const assinatura = request.headers.get("stripe-signature")

  if (!assinatura) {
    return NextResponse.json({ erro: "assinatura ausente" }, { status: 400 })
  }

  let evento: Stripe.Event
  try {
    evento = stripe.webhooks.constructEvent(
      corpo,
      assinatura,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (erro) {
    console.error("Assinatura do webhook do Stripe inválida:", erro)
    return NextResponse.json({ erro: "assinatura inválida" }, { status: 400 })
  }

  switch (evento.type) {
    // Pagamento único da noiva — assinatura da cerimonialista é tratada nos
    // eventos de subscription abaixo (o Stripe já emite
    // customer.subscription.created em seguida, com o mesmo metadata via
    // subscription_data).
    case "checkout.session.completed": {
      const session = evento.data.object as Stripe.Checkout.Session
      if (session.mode === "payment" && session.metadata?.tipo === "noiva") {
        const weddingId = session.metadata.weddingId
        if (weddingId) {
          await db.update(weddings).set({ pago: true }).where(eq(weddings.id, weddingId))
        }
      }
      break
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = evento.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId
      const plano = subscription.metadata?.plano
      if (userId && ehPlanoValido(plano)) {
        const ativa =
          subscription.status === "active" || subscription.status === "trialing"
        await db
          .update(profiles)
          .set({ planoCerimonialista: ativa ? plano : null })
          .where(eq(profiles.id, userId))
      }
      break
    }

    case "customer.subscription.deleted": {
      const subscription = evento.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId
      // Só derruba o plano — casamentos já cadastrados continuam intactos e
      // acessíveis (só criarCasamento passa a bloquear cadastro novo).
      if (userId) {
        await db
          .update(profiles)
          .set({ planoCerimonialista: null })
          .where(eq(profiles.id, userId))
      }
      break
    }

    default:
      break
  }

  return NextResponse.json({ recebido: true })
}
