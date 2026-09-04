// Convenção de path de todo upload direto do navegador pro Supabase
// Storage: "{wedding_id}/{uuid}.ext" — nunca o nome original do arquivo.
// Nomes reais (screenshot do macOS, principalmente) às vezes vêm em Unicode
// decomposto ("a" + acento combinante em vez do caractere composto) ou com
// espaço/caracteres que a API de Storage do Supabase rejeita com 400 Bad
// Request; extensão sozinha, sanitizada, evita essa classe inteira de
// problema. O nome de exibição (o que a usuária via ao salvar o arquivo)
// é guardado à parte quando faz sentido mostrar de volta pra ela depois —
// ver `documents.nome`, por exemplo — nunca depende do path do Storage.
export function caminhoArquivoStorage(weddingId: string, arquivo: File): string {
  const extensao = arquivo.name
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "")
  return `${weddingId}/${crypto.randomUUID()}${extensao ? `.${extensao}` : ""}`
}
