import "server-only"

import { sql } from "drizzle-orm"
import { headers } from "next/headers"

import { db } from "@/db"
import { rateLimits } from "@/db/schema"

/**
 * IP de quem fez a requisição, a partir do cabeçalho que a Vercel injeta —
 * Server Actions não têm acesso direto ao objeto da requisição, só a
 * `headers()`. Sem valor confiável (dev local, proxy desconhecido), cai num
 * balde único ("desconhecido") — pior caso é todo mundo sem IP identificável
 * dividindo o mesmo limite, não perder a proteção inteira.
 */
async function obterIpRequisicao(): Promise<string> {
  const cabecalhos = await headers()
  const encaminhado = cabecalhos.get("x-forwarded-for")
  if (encaminhado) return encaminhado.split(",")[0].trim()
  return cabecalhos.get("x-real-ip") ?? "desconhecido"
}

/**
 * `true` se a ação identificada por `acao` ainda está dentro do limite pra
 * este IP na janela de tempo atual — usa o client administrativo (`db`),
 * mesma exceção documentada em `src/db/index.ts`: essa tabela não tem
 * policy de RLS nenhuma, então só a conexão administrativa consegue
 * gravar nela. Upsert atômico (`onConflictDoUpdate` incrementando em SQL,
 * não lendo e regravando em dois passos) evita corrida entre requisições
 * simultâneas do mesmo IP.
 */
export async function dentroDoLimite(
  acao: string,
  limite: number,
  janelaSegundos: number
): Promise<boolean> {
  const ip = await obterIpRequisicao()
  const chave = `${acao}:${ip}`
  const janela = Math.floor(Date.now() / 1000 / janelaSegundos)

  const [linha] = await db
    .insert(rateLimits)
    .values({ chave, janela, contagem: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.chave, rateLimits.janela],
      set: { contagem: sql`${rateLimits.contagem} + 1` },
    })
    .returning({ contagem: rateLimits.contagem })

  return (linha?.contagem ?? 0) <= limite
}

export const MENSAGEM_LIMITE_EXCEDIDO =
  "Muitas tentativas. Tente novamente em alguns minutos."
