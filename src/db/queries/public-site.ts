import { eq, sql } from "drizzle-orm"
import { cache } from "react"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { gifts, guests, weddings } from "@/db/schema"

// Os `columns` abaixo espelham exatamente os GRANTs de coluna dados a `anon`
// na migration 0001 (ver CLAUDE.md > "Grants de coluna para anon") — pedir
// qualquer coluna fora dessa lista faz a query falhar com "permission
// denied" quando quem está vendo a página não está logada.

/**
 * Casamento visível na página pública: só retorna algo quando `publicado`
 * é `true` (regra de RLS de `weddings` — ver Fase 2). Só os campos de
 * "vitrine" são buscados, nunca orçamento ou dados internos do casamento.
 */
export const getWeddingPublicaPorSlug = cache(async function getWeddingPublicaPorSlug(
  slug: string
) {
  const { rls } = await createDrizzleSupabaseClient()
  const wedding = await rls((tx) =>
    tx.query.weddings.findFirst({
      where: eq(weddings.slug, slug),
      columns: {
        id: true,
        nomeNoiva: true,
        nomeNoivo: true,
        dataCasamento: true,
        horaCerimonia: true,
        localCerimonia: true,
        enderecoCerimonia: true,
        localFesta: true,
        enderecoFesta: true,
        cidade: true,
        estado: true,
        estilo: true,
        historiaCasal: true,
        fotoCapaUrl: true,
        dressCode: true,
        slug: true,
        publicado: true,
      },
    })
  )
  return wedding?.publicado ? wedding : undefined
})

export async function getGiftsPublicos(weddingId: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls((tx) =>
    tx.query.gifts.findMany({
      where: eq(gifts.weddingId, weddingId),
      columns: {
        id: true,
        nome: true,
        descricao: true,
        imagemUrl: true,
        preco: true,
        linkLoja: true,
        chavePix: true,
        reservadoPorNome: true,
        recebido: true,
      },
    })
  )
}

export type ResultadoBuscaConvidado = { id: string; nome: string; codigoRsvp: string }

export async function buscarConvidadosPublico(
  weddingId: string,
  termo: string
): Promise<ResultadoBuscaConvidado[]> {
  const { rls } = await createDrizzleSupabaseClient()
  const linhas = await rls((tx) =>
    tx.execute<{ id: string; nome: string; codigo_rsvp: string }>(
      sql`select * from public.buscar_convidados_publico(${weddingId}, ${termo})`
    )
  )
  return linhas.map((linha) => ({
    id: linha.id,
    nome: linha.nome,
    codigoRsvp: linha.codigo_rsvp,
  }))
}

export async function getGuestPorCodigo(codigo: string) {
  const { rls } = await createDrizzleSupabaseClient()
  return rls(
    (tx) =>
      tx.query.guests.findFirst({
        where: eq(guests.codigoRsvp, codigo),
        columns: {
          id: true,
          weddingId: true,
          nome: true,
          grupo: true,
          lado: true,
          acompanhantes: true,
          crianca: true,
          restricaoAlimentar: true,
          statusRsvp: true,
          codigoRsvp: true,
        },
      }),
    { guestCode: codigo }
  )
}
