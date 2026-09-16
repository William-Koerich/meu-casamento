export type BlocoNavMarkdown = "rsvp" | "presentes" | "local"

export type SegmentoMarkdownPublico =
  { tipo: "texto"; markdown: string } | { tipo: "nav"; bloco: BlocoNavMarkdown }

const TOKENS_NAV: BlocoNavMarkdown[] = ["rsvp", "presentes", "local"]

/**
 * Divide o markdown da página pública em texto normal e os marcadores
 * `[[rsvp]]`/`[[presentes]]`/`[[local]]` — cada marcador precisa ocupar a
 * própria linha (sem mais nada além de espaços). Permite a dona escrever
 * livremente e ainda posicionar os cartões de navegação (que dependem de
 * lógica real — RSVP, reserva de presente — não só de texto) em qualquer
 * ponto do conteúdo, em vez de ficarem numa lista separada de blocos.
 */
export function dividirMarkdownPublico(conteudo: string): SegmentoMarkdownPublico[] {
  const linhas = conteudo.split("\n")
  const segmentos: SegmentoMarkdownPublico[] = []
  let buffer: string[] = []

  function flush() {
    if (buffer.length === 0) return
    const markdown = buffer.join("\n").trim()
    if (markdown) segmentos.push({ tipo: "texto", markdown })
    buffer = []
  }

  for (const linha of linhas) {
    const token = linha.trim().toLowerCase()
    const match = token.match(/^\[\[(rsvp|presentes|local)\]\]$/)
    if (match && TOKENS_NAV.includes(match[1] as BlocoNavMarkdown)) {
      flush()
      segmentos.push({ tipo: "nav", bloco: match[1] as BlocoNavMarkdown })
    } else {
      buffer.push(linha)
    }
  }
  flush()

  return segmentos
}
