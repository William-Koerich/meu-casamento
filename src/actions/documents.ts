"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { documents } from "@/db/schema"
import { createClient } from "@/lib/supabase/server"
import { documentoSchema } from "@/lib/validators/documents"

type ResultadoAction = { erro: string } | { erro?: undefined }

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

export async function excluirDocumento(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(documents).where(eq(documents.id, id)))
  } catch {
    return { erro: "Não foi possível excluir o documento." }
  }

  revalidatePath("/app/fornecedores")
  revalidatePath("/app/documentos")
  return {}
}

export async function obterUrlAssinadaDocumento(
  caminho: string
): Promise<{ url: string } | { erro: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from("documentos")
    .createSignedUrl(caminho, 60)

  if (error || !data) return { erro: "Não foi possível gerar o link do arquivo." }
  return { url: data.signedUrl }
}
