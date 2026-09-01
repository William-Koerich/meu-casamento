import type { Metadata } from "next"

import { garantirBlocosPadrao } from "@/actions/page-blocks"
import { getBlocosDoCasamento } from "@/db/queries/page-blocks"
import { getMinhaWedding } from "@/db/queries/weddings"

import { SitePublicoView } from "./site-publico-view"

export const metadata: Metadata = { title: "Página pública" }

export default async function SitePublicoPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  await garantirBlocosPadrao()
  const blocos = await getBlocosDoCasamento(wedding.id)

  return (
    <div>
      <h1 className="font-heading mb-1 text-2xl">Página pública</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Arraste pra reordenar, oculte o que não quiser mostrar e adicione fotos, galerias
        e textos onde fizer sentido.
      </p>
      <SitePublicoView weddingId={wedding.id} blocos={blocos} slug={wedding.slug} />
    </div>
  )
}
