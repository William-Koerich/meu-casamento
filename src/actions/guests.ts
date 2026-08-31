"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { guests } from "@/db/schema"
import { gerarCodigo } from "@/lib/utils"
import {
  convidadoSchema,
  linhaImportacaoSchema,
  type LinhaImportacao,
} from "@/lib/validators/guests"

type ResultadoAction = { erro: string } | { erro?: undefined }

function revalidarConvidados() {
  revalidatePath("/app/convidados")
  revalidatePath("/app/convidados/mesas")
  revalidatePath("/app")
}

function ehViolacaoDeCodigoDuplicado(erro: unknown) {
  return Boolean(
    erro && typeof erro === "object" && "code" in erro && erro.code === "23505"
  )
}

export async function criarConvidado(input: unknown): Promise<ResultadoAction> {
  const dados = convidadoSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  let criado = false
  for (let tentativa = 0; tentativa < 3 && !criado; tentativa++) {
    try {
      await rls((tx) =>
        tx.insert(guests).values({
          weddingId: wedding.id,
          nome: dados.data.nome,
          email: dados.data.email || null,
          telefone: dados.data.telefone || null,
          grupo: dados.data.grupo as (typeof guests.$inferInsert)["grupo"],
          lado: dados.data.lado as (typeof guests.$inferInsert)["lado"],
          acompanhantes: dados.data.acompanhantes,
          crianca: dados.data.crianca,
          restricaoAlimentar: dados.data.restricaoAlimentar || null,
          observacoes: dados.data.observacoes || null,
          codigoRsvp: gerarCodigo(),
        })
      )
      criado = true
    } catch (erro) {
      if (!ehViolacaoDeCodigoDuplicado(erro))
        return { erro: "Não foi possível criar o convidado." }
    }
  }

  if (!criado) return { erro: "Não foi possível criar o convidado." }
  revalidarConvidados()
  return {}
}

export async function atualizarConvidado(
  id: string,
  input: unknown
): Promise<ResultadoAction> {
  const dados = convidadoSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(guests)
        .set({
          nome: dados.data.nome,
          email: dados.data.email || null,
          telefone: dados.data.telefone || null,
          grupo: dados.data.grupo as (typeof guests.$inferInsert)["grupo"],
          lado: dados.data.lado as (typeof guests.$inferInsert)["lado"],
          acompanhantes: dados.data.acompanhantes,
          crianca: dados.data.crianca,
          restricaoAlimentar: dados.data.restricaoAlimentar || null,
          observacoes: dados.data.observacoes || null,
        })
        .where(eq(guests.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar o convidado." }
  }

  revalidarConvidados()
  return {}
}

export async function atualizarRsvpInline(
  id: string,
  statusRsvp: (typeof guests.$inferInsert)["statusRsvp"]
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(guests)
        .set({ statusRsvp, respondidoEm: new Date() })
        .where(eq(guests.id, id))
    )
  } catch {
    return { erro: "Não foi possível atualizar o RSVP." }
  }

  revalidarConvidados()
  return {}
}

export async function excluirConvidado(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(guests).where(eq(guests.id, id)))
  } catch {
    return { erro: "Não foi possível excluir o convidado." }
  }

  revalidarConvidados()
  return {}
}

export async function marcarConviteEnviado(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.update(guests).set({ conviteEnviadoEm: new Date() }).where(eq(guests.id, id))
    )
  } catch {
    return { erro: "Não foi possível atualizar o convite." }
  }

  revalidarConvidados()
  return {}
}

export async function importarConvidadosCsv(
  linhasBrutas: unknown[]
): Promise<{ erro?: string; importados: number }> {
  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado.", importados: 0 }

  const linhas: LinhaImportacao[] = []
  for (const linha of linhasBrutas) {
    const dados = linhaImportacaoSchema.safeParse(linha)
    if (dados.success) linhas.push(dados.data)
  }
  if (linhas.length === 0)
    return { erro: "Nenhuma linha válida encontrada.", importados: 0 }

  const { rls } = await createDrizzleSupabaseClient()
  let importados = 0
  for (const linha of linhas) {
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      try {
        await rls((tx) =>
          tx.insert(guests).values({
            weddingId: wedding.id,
            nome: linha.nome,
            email: linha.email || null,
            telefone: linha.telefone || null,
            grupo: linha.grupo as (typeof guests.$inferInsert)["grupo"],
            lado: linha.lado as (typeof guests.$inferInsert)["lado"],
            acompanhantes: linha.acompanhantes,
            codigoRsvp: gerarCodigo(),
          })
        )
        importados++
        break
      } catch (erro) {
        if (!ehViolacaoDeCodigoDuplicado(erro)) break
      }
    }
  }

  revalidarConvidados()
  return { importados }
}
