// Nome do produto — isolado aqui pra trocar num lugar só se mudar de novo.
export const NOME_PRODUTO = "Organiza meu Casamento"
export const DESCRICAO_PRODUTO = "Planeje cada detalhe do seu casamento em um só lugar."

/**
 * URL base do deploy, normalizada — usada em metadata, sitemap/robots, links
 * de convite/RSVP e no link público exibido em Configurações. Tolera erros
 * comuns de preenchimento de NEXT_PUBLIC_APP_URL na Vercel: valor vazio
 * (`||`, não `??` — string vazia não é undefined), sem "https://" na frente
 * (já causou `new URL()` inválida derrubando o build inteiro em
 * `layout.tsx`) e com "/" sobrando no final (gera "//" ao concatenar rota).
 */
export function getUrlBase(): string {
  const bruto = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").trim()
  const comProtocolo = /^https?:\/\//.test(bruto) ? bruto : `https://${bruto}`
  return comProtocolo.replace(/\/+$/, "")
}
