"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import {
  excluirComRetorno,
  restaurarLinha,
  type ResultadoExclusao,
} from "@/db/delete-helpers"
import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { giftContributions, gifts } from "@/db/schema"
import { presenteSchema } from "@/lib/validators/gifts"

type ResultadoAction = { erro: string } | { erro?: undefined }
type Presente = typeof gifts.$inferSelect
type Contribuicao = typeof giftContributions.$inferSelect

function revalidar() {
  revalidatePath("/app/presentes")
}

export async function criarPresente(input: unknown): Promise<ResultadoAction> {
  const dados = presenteSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.insert(gifts).values({
        weddingId: wedding.id,
        nome: dados.data.nome,
        descricao: dados.data.descricao || null,
        preco: dados.data.preco != null ? String(dados.data.preco) : null,
        linkLoja: dados.data.linkLoja || null,
        chavePix: dados.data.chavePix || null,
        imagemUrl: dados.data.imagemUrl || null,
        aceitaCotas: dados.data.aceitaCotas,
      })
    )
  } catch {
    return { erro: "Não foi possível salvar o presente." }
  }

  revalidar()
  return {}
}

export async function atualizarPresente(
  id: string,
  input: unknown
): Promise<ResultadoAction> {
  const dados = presenteSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx
        .update(gifts)
        .set({
          nome: dados.data.nome,
          descricao: dados.data.descricao || null,
          preco: dados.data.preco != null ? String(dados.data.preco) : null,
          linkLoja: dados.data.linkLoja || null,
          chavePix: dados.data.chavePix || null,
          imagemUrl: dados.data.imagemUrl || null,
          aceitaCotas: dados.data.aceitaCotas,
        })
        .where(eq(gifts.id, id))
    )
  } catch {
    return { erro: "Não foi possível salvar o presente." }
  }

  revalidar()
  return {}
}

export async function alternarRecebido(
  id: string,
  recebido: boolean
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.update(gifts).set({ recebido }).where(eq(gifts.id, id)))
  } catch {
    return { erro: "Não foi possível atualizar." }
  }

  revalidar()
  return {}
}

// Restaurar não traz de volta as contribuições apagadas em cascata
// (`gift_contributions.giftId`, `onDelete: "cascade"`) — mesma ressalva já
// documentada em `delete-helpers.ts` pra item de orçamento/pagamento.
export async function excluirPresente(id: string): Promise<ResultadoExclusao<Presente>> {
  const { rls } = await createDrizzleSupabaseClient()
  let linha: Presente | null
  try {
    linha = await rls((tx) => excluirComRetorno(tx, gifts, gifts.id, id))
  } catch {
    return { erro: "Não foi possível excluir o presente." }
  }
  if (!linha) return { erro: "Presente não encontrado." }
  revalidar()
  return { linha }
}

export async function restaurarPresente(presente: Presente): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => restaurarLinha(tx, gifts, presente))
  } catch {
    return { erro: "Não foi possível restaurar o presente." }
  }

  revalidar()
  return {}
}

export async function alternarContribuicaoRecebida(
  id: string,
  recebido: boolean
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.update(giftContributions).set({ recebido }).where(eq(giftContributions.id, id))
    )
  } catch {
    return { erro: "Não foi possível atualizar." }
  }

  revalidar()
  return {}
}

export async function excluirContribuicao(
  id: string
): Promise<ResultadoExclusao<Contribuicao>> {
  const { rls } = await createDrizzleSupabaseClient()
  let linha: Contribuicao | null
  try {
    linha = await rls((tx) =>
      excluirComRetorno(tx, giftContributions, giftContributions.id, id)
    )
  } catch {
    return { erro: "Não foi possível excluir a contribuição." }
  }
  if (!linha) return { erro: "Contribuição não encontrada." }
  revalidar()
  return { linha }
}

export async function restaurarContribuicao(
  contribuicao: Contribuicao
): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => restaurarLinha(tx, giftContributions, contribuicao))
  } catch {
    return { erro: "Não foi possível restaurar a contribuição." }
  }

  revalidar()
  return {}
}
