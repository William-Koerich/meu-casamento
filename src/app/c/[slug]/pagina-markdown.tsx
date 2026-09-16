import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Card, CardContent } from "@/components/ui/card"
import { dividirMarkdownPublico, type BlocoNavMarkdown } from "@/lib/markdown-publico"

const NAV_MARKDOWN: Record<BlocoNavMarkdown, { rota: string; rotulo: string }> = {
  rsvp: { rota: "confirmar", rotulo: "Confirmar presença" },
  presentes: { rota: "presentes", rotulo: "Lista de presentes" },
  local: { rota: "local", rotulo: "Local e horários" },
}

const CLASSES_CONTEUDO =
  "[&_h1]:font-heading [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-3xl " +
  "[&_h2]:font-heading [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl " +
  "[&_h3]:font-heading [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl " +
  "[&_p]:text-muted-foreground [&_p]:mb-4 [&_p]:leading-relaxed " +
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_strong]:text-foreground " +
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 " +
  "[&_li]:text-muted-foreground " +
  "[&_blockquote]:border-primary [&_blockquote]:text-muted-foreground [&_blockquote]:mb-4 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic " +
  "[&_img]:my-4 [&_img]:w-full [&_img]:rounded " +
  "[&_hr]:border-border [&_hr]:my-8"

/** Conteúdo em si (sem o fundo) — reaproveitado na prévia do editor. */
export function PaginaMarkdownConteudo({
  conteudo,
  slug,
}: {
  conteudo: string
  slug: string
}) {
  const segmentos = dividirMarkdownPublico(conteudo)

  if (segmentos.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Escreva o conteúdo da página em Markdown na aba de edição.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {segmentos.map((segmento, indice) =>
        segmento.tipo === "nav" ? (
          <Link
            key={indice}
            href={`/c/${slug}/${NAV_MARKDOWN[segmento.bloco].rota}`}
            className="my-6 block"
          >
            <Card className="hover:bg-accent/30 text-center transition-colors">
              <CardContent>{NAV_MARKDOWN[segmento.bloco].rotulo}</CardContent>
            </Card>
          </Link>
        ) : (
          <div key={indice} className={CLASSES_CONTEUDO}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{segmento.markdown}</ReactMarkdown>
          </div>
        )
      )}
    </div>
  )
}

/** Página pública inteira em modo Markdown, com o fundo opcional. */
export function PaginaMarkdownPublica({
  conteudo,
  fundoUrl,
  slug,
}: {
  conteudo: string
  fundoUrl: string | null
  slug: string
}) {
  return (
    <div className="relative">
      {fundoUrl && (
        <>
          <div
            className="fixed inset-0 -z-20 bg-cover bg-fixed bg-center"
            style={{ backgroundImage: `url(${fundoUrl})` }}
          />
          <div className="bg-background/85 fixed inset-0 -z-10" />
        </>
      )}
      <PaginaMarkdownConteudo conteudo={conteudo} slug={slug} />
    </div>
  )
}
