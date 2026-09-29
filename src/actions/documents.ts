"use server"

import { revalidatePath } from "next/cache"

import { obterUrlAssinada } from "@/actions/storage"
import {
  excluirComRetorno,
  restaurarLinha,
  type ResultadoExclusao,
} from "@/db/delete-helpers"
import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { documents } from "@/db/schema"
import { documentoSchema } from "@/lib/validators/documents"

type ResultadoAction = { erro: string } | { erro?: undefined }
type Documento = typeof documents.$inferSelect

export async function criarDocumento(input: unknown): Promise<ResultadoAction> {
  const dados = documentoSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os campos obrigatórios." }

  const wedding = await getMinhaWedding()
  if (!wedding) return { erro: "Casamento não encontrado." }

  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) =>
      tx.insert(documents).values({
        weddingId: wedding.id,
        nome: dados.data.nome,
        tipo: dados.data.tipo as (typeof documents.$inferInsert)["tipo"],
        arquivoUrl: dados.data.arquivoUrl,
        vendorId: dados.data.vendorId || null,
      })
    )
  } catch {
    return { erro: "Não foi possível salvar o documento." }
  }

  revalidatePath("/app/fornecedores")
  revalidatePath("/app/documentos")
  return {}
}

export async function excluirDocumento(
  id: string
): Promise<ResultadoExclusao<Documento>> {
  const { rls } = await createDrizzleSupabaseClient()
  let linha: Documento | null
  try {
    linha = await rls((tx) => excluirComRetorno(tx, documents, documents.id, id))
  } catch {
    return { erro: "Não foi possível excluir o documento." }
  }
  if (!linha) return { erro: "Documento não encontrado." }

  revalidatePath("/app/fornecedores")
  revalidatePath("/app/documentos")
  return { linha }
}

export async function restaurarDocumento(documento: Documento): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => restaurarLinha(tx, documents, documento))
  } catch {
    return { erro: "Não foi possível restaurar o documento." }
  }

  revalidatePath("/app/fornecedores")
  revalidatePath("/app/documentos")
  return {}
}

export async function obterUrlAssinadaDocumento(
  caminho: string
): Promise<{ url: string } | { erro: string }> {
  const url = await obterUrlAssinada("documentos", caminho)
  if (!url) return { erro: "Não foi possível gerar o link do arquivo." }
  return { url }
}
