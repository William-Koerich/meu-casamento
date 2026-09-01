import { pgEnum } from "drizzle-orm/pg-core"

// Compartilhado entre tasks (categoria) e vendors (categoria)
export const categoriaEnum = pgEnum("categoria", [
  "local",
  "buffet",
  "decoracao",
  "fotografia",
  "vestuario",
  "beleza",
  "musica",
  "convites",
  "documentacao",
  "transporte",
  "lembrancinhas",
  "bolo_doces",
  "cerimonial",
  "lua_de_mel",
  "outros",
])

export const papelMembroEnum = pgEnum("papel_membro", [
  "dona",
  "noivo",
  "familiar",
  "padrinho_madrinha",
  "cerimonialista",
])

export const permissaoMembroEnum = pgEnum("permissao_membro", [
  "admin",
  "editor",
  "leitor",
])

export const origemTarefaEnum = pgEnum("origem_tarefa", ["template", "manual"])

export const statusFornecedorEnum = pgEnum("status_fornecedor", [
  "pesquisando",
  "contatado",
  "proposta_recebida",
  "contratado",
  "descartado",
])

export const grupoConvidadoEnum = pgEnum("grupo_convidado", [
  "familia_noiva",
  "familia_noivo",
  "amigos_noiva",
  "amigos_noivo",
  "trabalho",
  "outros",
])

export const ladoConvidadoEnum = pgEnum("lado_convidado", ["noiva", "noivo", "ambos"])

export const statusRsvpEnum = pgEnum("status_rsvp", [
  "pendente",
  "confirmado",
  "recusado",
])

export const formatoMesaEnum = pgEnum("formato_mesa", [
  "redonda",
  "retangular",
  "imperial",
])

export const momentoMusicaEnum = pgEnum("momento_musica", [
  "entrada_noivo",
  "entrada_padrinhos",
  "entrada_noiva",
  "durante_cerimonia",
  "saida",
  "recepcao",
  "valsa",
  "festa",
  "nunca_tocar",
])

export const comodoEnxovalEnum = pgEnum("comodo_enxoval", [
  "cozinha",
  "sala",
  "quarto",
  "banheiro",
  "lavanderia",
  "area_externa",
  "outros",
])

export const prioridadeEnxovalEnum = pgEnum("prioridade_enxoval", [
  "alta",
  "media",
  "baixa",
])

export const tipoDocumentoEnum = pgEnum("tipo_documento", [
  "contrato",
  "certidao",
  "orcamento",
  "recibo",
  "outro",
])

// "historia"/"nav_rsvp"/"nav_presentes"/"nav_local" são as seções já
// existentes da página pública (agora reordenáveis/ocultáveis); "foto",
// "galeria" e "texto" são conteúdo livre que a dona monta como quiser.
export const blockTipoEnum = pgEnum("block_tipo", [
  "historia",
  "nav_rsvp",
  "nav_presentes",
  "nav_local",
  "foto",
  "galeria",
  "texto",
])
