import type { Metadata } from "next"

import { obterUrlsAssinadas } from "@/actions/storage"
import { getInspirations } from "@/db/queries/inspirations"
import { getMinhaWedding } from "@/db/queries/weddings"

import { InspirationFormDialog } from "./inspiration-form-dialog"
import { Moodboard } from "./moodboard"

export const metadata: Metadata = { title: "Inspirações" }

export default async function InspiracoesPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const itens = await getInspirations(wedding.id)
  const caminhos = itens.flatMap((item) => (item.imagemUrl ? [item.imagemUrl] : []))
  const urls = await obterUrlsAssinadas("inspiracoes", caminhos)

  const itensComUrl = itens.map((item) => ({
    ...item,
    urlAssinada: item.imagemUrl ? (urls[item.imagemUrl] ?? null) : null,
  }))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Inspirações</h1>
        <InspirationFormDialog weddingId={wedding.id} />
      </div>
      <Moodboard itens={itensComUrl} />
    </div>
  )
}
