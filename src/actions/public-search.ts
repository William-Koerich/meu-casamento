"use server"

import { buscarConvidadosPublico, getGuestPorCodigo } from "@/db/queries/public-site"

export type BuscaConvidadoResultado =
  | {
      tipo: "convidado"
      convidado: NonNullable<Awaited<ReturnType<typeof getGuestPorCodigo>>>
    }
  | {
      tipo: "candidatos"
      candidatos: Awaited<ReturnType<typeof buscarConvidadosPublico>>
    }
  | { tipo: "nenhum" }

export async function buscarConvidadoPublico(
  weddingId: string,
  termo: string
): Promise<BuscaConvidadoResultado> {
  const termoLimpo = termo.trim()
  if (!termoLimpo) return { tipo: "nenhum" }

  const porCodigo = await getGuestPorCodigo(termoLimpo.toUpperCase())
  if (porCodigo && porCodigo.weddingId === weddingId) {
    return { tipo: "convidado", convidado: porCodigo }
  }

  const candidatos = await buscarConvidadosPublico(weddingId, termoLimpo)
  if (candidatos.length === 0) return { tipo: "nenhum" }
  return { tipo: "candidatos", candidatos }
}

export async function buscarConvidadoPorCodigo(codigo: string) {
  return getGuestPorCodigo(codigo.toUpperCase())
}
