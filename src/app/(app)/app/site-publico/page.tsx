import type { Metadata } from "next"

import { garantirBlocosPadrao } from "@/actions/page-blocks"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getBlocosDoCasamento } from "@/db/queries/page-blocks"
import { getMinhaWedding } from "@/db/queries/weddings"

import { MarkdownEditorView } from "./markdown-editor-view"
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
        Monte por blocos (arrastar, ocultar, fotos e textos prontos) ou escreva a página
        inteira em Markdown, com liberdade total de organização.
      </p>
      <Tabs defaultValue={wedding.paginaMarkdownAtiva ? "markdown" : "blocos"}>
        <TabsList>
          <TabsTrigger value="blocos">Blocos</TabsTrigger>
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
        </TabsList>
        <TabsContent value="blocos" className="pt-4">
          <SitePublicoView weddingId={wedding.id} blocos={blocos} slug={wedding.slug} />
        </TabsContent>
        <TabsContent value="markdown" className="pt-4">
          <MarkdownEditorView
            weddingId={wedding.id}
            slug={wedding.slug}
            ativo={wedding.paginaMarkdownAtiva}
            conteudoInicial={wedding.paginaMarkdown ?? ""}
            fundoUrlInicial={wedding.paginaFundoUrl}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
