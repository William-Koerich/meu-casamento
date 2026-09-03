"use server"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { db } from "@/db"
import { getMeuPerfil } from "@/db/queries/profiles"
import { getMinhaWedding } from "@/db/queries/weddings"
import { profiles } from "@/db/schema"
import {
  precoStripeCerimonialista,
  precoStripeNoiva,
  type PlanoCerimonialista,
} from "@/lib/planos"
import { getUrlBase } from "@/lib/site"
import { getStripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

type ResultadoAction = { erro: string } | { erro?: undefined }

async function usuarioAtual() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/entrar")
  return user
}

/**
 * `profiles.stripeCustomerId` teve UPDATE revogado da role "authenticated"
 * (migration 0010 — ninguém pode se autoconceder um customer/plano
 * chamando a REST API do Supabase por fora do app). Por isso essa única
 * escrita usa o client administrativo (`db`, normalmente restrito a
 * migrations/seed — ver CLAUDE.md) em vez de `rls()`: é bookkeeping de
 * sistema, não dado de negócio do casamento, e a linha afetada é sempre a
 * da própria usuária autenticada (`user.id` vem da sessão verificada, não
 * de input do cliente).
 */
async function obterOuCriarStripeCustomerId(userId: string, email: string | undefined) {
  const perfil = await getMeuPerfil()
  if (perfil?.stripeCustomerId) return perfil.stripeCustomerId

  const customer = await getStripe().customers.create({
    email,
    metadata: { userId },
  })
  await db
    .update(profiles)
    .set({ stripeCustomerId: customer.id })
    .where(eq(profiles.id, userId))
  return customer.id
}

export async function criarCheckoutNoiva(): Promise<ResultadoAction> {
  const user = await usuarioAtual()
  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }
  if (wedding.pago) redirect("/app")

  const customerId = await obterOuCriarStripeCustomerId(user.id, user.email)
  const base = getUrlBase()

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: precoStripeNoiva(), quantity: 1 }],
    success_url: `${base}/pagamento/sucesso`,
    cancel_url: `${base}/pagamento`,
    // O webhook (checkout.session.completed) usa isso pra saber qual
    // casamento marcar como pago — nunca confiamos no redirect de sucesso
    // por si só pra liberar acesso.
    metadata: { tipo: "noiva", weddingId: wedding.id },
  })

  if (!session.url)
    return { erro: "Não foi possível iniciar o pagamento. Tente novamente." }
  redirect(session.url)
}

export async function criarCheckoutCerimonialista(
  plano: PlanoCerimonialista
): Promise<ResultadoAction> {
  const user = await usuarioAtual()
  const perfil = await getMeuPerfil()
  if (perfil?.tipoConta !== "cerimonialista") {
    return { erro: "Só contas de cerimonialista assinam esses planos." }
  }

  const customerId = await obterOuCriarStripeCustomerId(user.id, user.email)
  const base = getUrlBase()

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: precoStripeCerimonialista(plano), quantity: 1 }],
    success_url: `${base}/planos?assinatura=sucesso`,
    cancel_url: `${base}/planos`,
    // Fica gravado no objeto subscription em si — todo evento futuro sobre
    // essa assinatura (renovação, cancelamento) já vem com esse metadata,
    // sem precisar de uma tabela de mapeamento subscription -> conta.
    subscription_data: { metadata: { userId: user.id, plano } },
  })

  if (!session.url)
    return { erro: "Não foi possível iniciar a assinatura. Tente novamente." }
  redirect(session.url)
}

export async function criarSessaoPortal(): Promise<ResultadoAction> {
  await usuarioAtual()
  const perfil = await getMeuPerfil()
  if (!perfil?.stripeCustomerId) {
    return { erro: "Você ainda não tem nenhuma assinatura para gerenciar." }
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: perfil.stripeCustomerId,
    return_url: `${getUrlBase()}/planos`,
  })

  redirect(session.url)
}
