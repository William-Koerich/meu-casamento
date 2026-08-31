import type { categoriaEnum, statusFornecedorEnum } from "@/db/schema"

type Categoria = (typeof categoriaEnum.enumValues)[number]
type StatusFornecedor = (typeof statusFornecedorEnum.enumValues)[number]

// Rótulos em português dos enums de domínio — únicos usados em toda a UI
// (não duplicar essas listas em componentes).
export const CATEGORIA_LABELS: Record<Categoria, string> = {
  local: "Local",
  buffet: "Buffet",
  decoracao: "Decoração",
  fotografia: "Fotografia",
  vestuario: "Vestuário",
  beleza: "Beleza",
  musica: "Música",
  convites: "Convites",
  documentacao: "Documentação",
  transporte: "Transporte",
  lembrancinhas: "Lembrancinhas",
  bolo_doces: "Bolo e doces",
  cerimonial: "Cerimonial",
  lua_de_mel: "Lua de mel",
  outros: "Outros",
}

export const STATUS_FORNECEDOR_LABELS: Record<StatusFornecedor, string> = {
  pesquisando: "Pesquisando",
  contatado: "Contatado",
  proposta_recebida: "Proposta recebida",
  contratado: "Contratado",
  descartado: "Descartado",
}
