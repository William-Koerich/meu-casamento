import type { Metadata } from "next"

import { getMinhaWedding } from "@/db/queries/weddings"

import { MarkdownEditorView } from "./markdown-editor-view"

export const metadata: Metadata = { title: "Página pública" }

export default async function SitePublicoPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  return (
    <div>
      <h1 className="font-heading mb-1 text-2xl">Página pública</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Escreva a página inteira em Markdown, com liberdade total de organização — título,
        texto, fotos e os cartões de RSVP/presentes/local onde você quiser.
      </p>
      <MarkdownEditorView
        weddingId={wedding.id}
        slug={wedding.slug}
        ativo={wedding.paginaMarkdownAtiva}
        conteudoInicial={wedding.paginaMarkdown ?? ""}
        fundoUrlInicial={wedding.paginaFundoUrl}
      />
    </div>
  )
}
