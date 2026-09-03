import type {
  blockTipoEnum,
  categoriaEnum,
  comodoEnxovalEnum,
  formatoMesaEnum,
  grupoConvidadoEnum,
  ladoConvidadoEnum,
  momentoMusicaEnum,
  papelMembroEnum,
  permissaoMembroEnum,
  planoCerimonialistaEnum,
  prioridadeEnxovalEnum,
  statusFornecedorEnum,
  statusRsvpEnum,
  tipoDocumentoEnum,
} from "@/db/schema"

type Categoria = (typeof categoriaEnum.enumValues)[number]
type StatusFornecedor = (typeof statusFornecedorEnum.enumValues)[number]
type GrupoConvidado = (typeof grupoConvidadoEnum.enumValues)[number]
type LadoConvidado = (typeof ladoConvidadoEnum.enumValues)[number]
type StatusRsvp = (typeof statusRsvpEnum.enumValues)[number]
type FormatoMesa = (typeof formatoMesaEnum.enumValues)[number]
type MomentoMusica = (typeof momentoMusicaEnum.enumValues)[number]
type ComodoEnxoval = (typeof comodoEnxovalEnum.enumValues)[number]
type PrioridadeEnxoval = (typeof prioridadeEnxovalEnum.enumValues)[number]
type TipoDocumento = (typeof tipoDocumentoEnum.enumValues)[number]
type PapelMembro = (typeof papelMembroEnum.enumValues)[number]
type PermissaoMembro = (typeof permissaoMembroEnum.enumValues)[number]
type BlockTipo = (typeof blockTipoEnum.enumValues)[number]
type PlanoCerimonialista = (typeof planoCerimonialistaEnum.enumValues)[number]

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

export const MOMENTO_LABELS: Record<MomentoMusica, string> = {
  entrada_noivo: "Entrada do noivo",
  entrada_padrinhos: "Entrada dos padrinhos",
  entrada_noiva: "Entrada da noiva",
  durante_cerimonia: "Durante a cerimônia",
  saida: "Saída",
  recepcao: "Recepção",
  valsa: "Valsa",
  festa: "Festa",
  nunca_tocar: "Nunca tocar",
}

export const COMODO_LABELS: Record<ComodoEnxoval, string> = {
  cozinha: "Cozinha",
  sala: "Sala",
  quarto: "Quarto",
  banheiro: "Banheiro",
  lavanderia: "Lavanderia",
  area_externa: "Área externa",
  outros: "Outros",
}

export const PRIORIDADE_LABELS: Record<PrioridadeEnxoval, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
}

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  contrato: "Contrato",
  certidao: "Certidão",
  orcamento: "Orçamento",
  recibo: "Recibo",
  outro: "Outro",
}

export const PAPEL_MEMBRO_LABELS: Record<PapelMembro, string> = {
  dona: "Dona do casamento",
  noivo: "Noivo(a)",
  familiar: "Familiar",
  padrinho_madrinha: "Padrinho/madrinha",
  cerimonialista: "Cerimonialista",
}

export const PERMISSAO_LABELS: Record<PermissaoMembro, string> = {
  admin: "Administrador(a)",
  editor: "Editor(a)",
  leitor: "Leitor(a)",
}

export const BLOCK_TIPO_LABELS: Record<BlockTipo, string> = {
  historia: "Nossa história",
  nav_rsvp: "Confirmar presença",
  nav_presentes: "Lista de presentes",
  nav_local: "Local e horários",
  foto: "Foto",
  galeria: "Galeria de fotos",
  texto: "Texto",
}

// Só esses 3 podem ser adicionados livremente pela dona — os outros 4 são
// as seções fixas do site (semeadas uma vez por garantirBlocosPadrao),
// reordenáveis/ocultáveis mas não duplicáveis.
export const BLOCK_TIPOS_ADICIONAVEIS = ["foto", "galeria", "texto"] as const

export const PLANO_CERIMONIALISTA_LABELS: Record<PlanoCerimonialista, string> = {
  basico: "Básico",
  premium: "Premium",
  platinum: "Platinum",
}
