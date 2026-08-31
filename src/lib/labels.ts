import type {
  categoriaEnum,
  formatoMesaEnum,
  grupoConvidadoEnum,
  ladoConvidadoEnum,
  statusFornecedorEnum,
  statusRsvpEnum,
} from "@/db/schema"

type Categoria = (typeof categoriaEnum.enumValues)[number]
type StatusFornecedor = (typeof statusFornecedorEnum.enumValues)[number]
type GrupoConvidado = (typeof grupoConvidadoEnum.enumValues)[number]
type LadoConvidado = (typeof ladoConvidadoEnum.enumValues)[number]
type StatusRsvp = (typeof statusRsvpEnum.enumValues)[number]
type FormatoMesa = (typeof formatoMesaEnum.enumValues)[number]

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

export const GRUPO_LABELS: Record<GrupoConvidado, string> = {
  familia_noiva: "Família da noiva",
  familia_noivo: "Família do noivo",
  amigos_noiva: "Amigos da noiva",
  amigos_noivo: "Amigos do noivo",
  trabalho: "Trabalho",
  outros: "Outros",
}

export const LADO_LABELS: Record<LadoConvidado, string> = {
  noiva: "Noiva",
  noivo: "Noivo",
  ambos: "Ambos",
}

export const STATUS_RSVP_LABELS: Record<StatusRsvp, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  recusado: "Recusado",
}

export const FORMATO_MESA_LABELS: Record<FormatoMesa, string> = {
  redonda: "Redonda",
  retangular: "Retangular",
  imperial: "Imperial",
}
