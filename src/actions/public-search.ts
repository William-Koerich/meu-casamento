"use server"

import { buscarConvidadosPublico, getGuestPorCodigo } from "@/db/queries/public-site"
import { dentroDoLimite } from "@/lib/rate-limit"

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
  | { tipo: "limite" }

export async function buscarConvidadoPublico(
  weddingId: string,
  termo: string
): Promise<BuscaConvidadoResultado> {
  if (!(await dentroDoLimite("buscar-convidado", 20, 60))) return { tipo: "limite" }

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
  if (!(await dentroDoLimite("buscar-convidado-codigo", 20, 60))) return null
  return getGuestPorCodigo(codigo.toUpperCase())
}
