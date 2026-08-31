"use server"

import { eq } from "drizzle-orm"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { gifts, guests } from "@/db/schema"
import {
  confirmarPresencaSchema,
  reservarPresenteSchema,
} from "@/lib/validators/public-rsvp"

type ResultadoAction = { erro: string } | { erro?: undefined }

export async function confirmarPresenca(
  codigo: string,
  input: unknown
): Promise<ResultadoAction> {
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
            acompanhantes: dados.data.acompanhantes,
            crianca: dados.data.crianca,
            restricaoAlimentar: dados.data.restricaoAlimentar || null,
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
