"use server"

import { eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { giftContributions, gifts, guestPhotos, guests } from "@/db/schema"
import { dentroDoLimite, MENSAGEM_LIMITE_EXCEDIDO } from "@/lib/rate-limit"
import {
  confirmarPresencaSchema,
  contribuirPresenteSchema,
  reservarPresenteSchema,
} from "@/lib/validators/public-rsvp"

type ResultadoAction = { erro: string } | { erro?: undefined }

export async function confirmarPresenca(
  codigo: string,
  input: unknown
): Promise<ResultadoAction> {
  if (!(await dentroDoLimite("confirmar-presenca", 10, 60))) {
    return { erro: MENSAGEM_LIMITE_EXCEDIDO }
  }

  const dados = confirmarPresencaSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    const linhas = await rls(
      (tx) =>
        tx
          .update(guests)
          .set({
            statusRsvp: dados.data.statusRsvp,
            respondidoEm: new Date(),
          })
          .where(eq(guests.codigoRsvp, codigo))
          .returning({ id: guests.id }),
      { guestCode: codigo }
    )
    if (linhas.length === 0) return { erro: "Código não encontrado." }
  } catch {
    return { erro: "Não foi possível confirmar. Tente novamente." }
  }

  return {}
}

export async function reservarPresente(
  giftId: string,
  input: unknown
): Promise<ResultadoAction> {
  if (!(await dentroDoLimite("reservar-presente", 10, 60))) {
    return { erro: MENSAGEM_LIMITE_EXCEDIDO }
  }

  const dados = reservarPresenteSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    const linhas = await rls((tx) =>
      tx
        .update(gifts)
        .set({
          reservadoPorNome: dados.data.nome,
          reservadoPorEmail: dados.data.email,
          reservadoEm: new Date(),
        })
        .where(eq(gifts.id, giftId))
        .returning({ id: gifts.id })
    )
    if (linhas.length === 0)
      return {
        erro: "Não foi possível reservar. Alguém pode já ter reservado este presente.",
      }
  } catch {
    return { erro: "Não foi possível reservar. Tente novamente." }
  }

  return {}
}

export async function contribuirPresente(
  giftId: string,
  input: unknown
): Promise<ResultadoAction> {
  if (!(await dentroDoLimite("contribuir-presente", 10, 60))) {
    return { erro: MENSAGEM_LIMITE_EXCEDIDO }
  }

  const dados = contribuirPresenteSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls(async (tx) => {
      const [presente] = await tx
        .select({ weddingId: gifts.weddingId, aceitaCotas: gifts.aceitaCotas })
        .from(gifts)
        .where(eq(gifts.id, giftId))
      if (!presente) throw new Error("Presente não encontrado.")
      if (!presente.aceitaCotas) throw new Error("Esse presente não aceita cotas.")

      // Sem `.returning()` de propósito: "gift_contributions" não tem
      // policy de SELECT pra anon (só INSERT), mesma pegadinha de RLS já
      // documentada pra `guest_photos` (Fase 11) — devolver a linha
      // inserida exigiria uma policy de SELECT que não deve existir aqui
      // (evita expor e-mail de outros convidados).
      await tx.insert(giftContributions).values({
        weddingId: presente.weddingId,
        giftId,
        nome: dados.data.nome,
        email: dados.data.email,
        valor: String(dados.data.valor),
      })
    })
  } catch {
    return { erro: "Não foi possível registrar sua contribuição. Tente novamente." }
  }

  return {}
}

export async function enviarFotosConvidado(
  weddingId: string,
  caminhos: string[],
  nomeConvidado: string
): Promise<ResultadoAction> {
  if (!(await dentroDoLimite("enviar-fotos-convidado", 10, 60))) {
    return { erro: MENSAGEM_LIMITE_EXCEDIDO }
  }
  if (caminhos.length === 0) return { erro: "Selecione ao menos uma foto." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.insert(guestPhotos).values(
        caminhos.map((caminho) => ({
          weddingId,
          caminho,
          nomeConvidado: nomeConvidado.trim() || null,
        }))
      )
    )
  } catch {
    return { erro: "Não foi possível enviar as fotos. Tente novamente." }
  }

  return {}
}
