import type { categoriaEnum } from "@/db/schema"

type Categoria = (typeof categoriaEnum.enumValues)[number]

export type ItemChecklistTemplate = {
  mesesAntes: number
  titulo: string
  categoria: Categoria
}

// Checklist padrão de 12 meses gerado automaticamente ao concluir o
// onboarding (ver src/actions/onboarding.ts). Textos e categorias exatamente
// como especificados — não alterar sem atualizar a spec do produto.
export const CHECKLIST_TEMPLATE: ItemChecklistTemplate[] = [
  // 12 meses antes
  {
    mesesAntes: 12,
    titulo: "Definir o estilo e o clima do casamento",
    categoria: "outros",
  },
  {
    mesesAntes: 12,
    titulo: "Fechar o orçamento total e quem contribui",
    categoria: "outros",
  },
  {
    mesesAntes: 12,
    titulo: "Montar a primeira versão da lista de convidados",
    categoria: "outros",
  },
  { mesesAntes: 12, titulo: "Definir a data e ter 2 alternativas", categoria: "outros" },
  {
    mesesAntes: 12,
    titulo: "Pesquisar e visitar locais de cerimônia",
    categoria: "local",
  },
  {
    mesesAntes: 12,
    titulo: "Pesquisar e visitar espaços para a festa",
    categoria: "local",
  },
  {
    mesesAntes: 12,
    titulo: "Abrir uma conta ou reserva só para o casamento",
    categoria: "outros",
  },
  // 11 meses antes
  {
    mesesAntes: 11,
    titulo: "Contratar o espaço e assinar o contrato",
    categoria: "local",
  },
  {
    mesesAntes: 11,
    titulo: "Reservar a igreja ou definir o celebrante",
    categoria: "local",
  },
  {
    mesesAntes: 11,
    titulo: "Contratar cerimonialista ou assessoria",
    categoria: "cerimonial",
  },
  { mesesAntes: 11, titulo: "Definir os padrinhos e madrinhas", categoria: "outros" },
  // 10 meses antes
  { mesesAntes: 10, titulo: "Degustar e contratar o buffet", categoria: "buffet" },
  { mesesAntes: 10, titulo: "Contratar fotógrafo", categoria: "fotografia" },
  { mesesAntes: 10, titulo: "Contratar videomaker", categoria: "fotografia" },
  {
    mesesAntes: 10,
    titulo: "Começar a pesquisar vestidos de noiva",
    categoria: "vestuario",
  },
  // 9 meses antes
  { mesesAntes: 9, titulo: "Contratar decoração e floricultura", categoria: "decoracao" },
  { mesesAntes: 9, titulo: "Contratar banda, DJ ou música ao vivo", categoria: "musica" },
  {
    mesesAntes: 9,
    titulo: "Comprar ou encomendar o vestido de noiva",
    categoria: "vestuario",
  },
  { mesesAntes: 9, titulo: "Definir o traje do noivo", categoria: "vestuario" },
  {
    mesesAntes: 9,
    titulo: "Reservar hospedagem para convidados de fora",
    categoria: "outros",
  },
  // 8 meses antes
  {
    mesesAntes: 8,
    titulo: "Fechar a lista de convidados definitiva",
    categoria: "outros",
  },
  { mesesAntes: 8, titulo: "Contratar bolo e doces", categoria: "bolo_doces" },
  { mesesAntes: 8, titulo: "Definir o save the date e enviar", categoria: "convites" },
  { mesesAntes: 8, titulo: "Iniciar tratamentos de pele e cabelo", categoria: "beleza" },
  // 7 meses antes
  { mesesAntes: 7, titulo: "Escolher e encomendar as alianças", categoria: "outros" },
  {
    mesesAntes: 7,
    titulo: "Contratar assessoria de beleza para o dia",
    categoria: "beleza",
  },
  { mesesAntes: 7, titulo: "Fazer teste de maquiagem e penteado", categoria: "beleza" },
  { mesesAntes: 7, titulo: "Definir o destino da lua de mel", categoria: "lua_de_mel" },
  // 6 meses antes
  { mesesAntes: 6, titulo: "Encomendar os convites", categoria: "convites" },
  { mesesAntes: 6, titulo: "Definir a lista de presentes", categoria: "outros" },
  { mesesAntes: 6, titulo: "Contratar transporte dos noivos", categoria: "transporte" },
  {
    mesesAntes: 6,
    titulo: "Reunir a documentação do casamento civil",
    categoria: "documentacao",
  },
  { mesesAntes: 6, titulo: "Dar entrada no cartório", categoria: "documentacao" },
  {
    mesesAntes: 6,
    titulo: "Comprar passagens e hospedagem da lua de mel",
    categoria: "lua_de_mel",
  },
  // 5 meses antes
  { mesesAntes: 5, titulo: "Primeira prova do vestido", categoria: "vestuario" },
  { mesesAntes: 5, titulo: "Definir as lembrancinhas", categoria: "lembrancinhas" },
  {
    mesesAntes: 5,
    titulo: "Escolher os trajes dos padrinhos e madrinhas",
    categoria: "vestuario",
  },
  { mesesAntes: 5, titulo: "Fazer o ensaio pré-wedding", categoria: "fotografia" },
  { mesesAntes: 5, titulo: "Definir o cardápio final com o buffet", categoria: "buffet" },
  // 4 meses antes
  { mesesAntes: 4, titulo: "Enviar os convites", categoria: "convites" },
  {
    mesesAntes: 4,
    titulo: "Definir a trilha sonora de cada momento",
    categoria: "musica",
  },
  {
    mesesAntes: 4,
    titulo: "Contratar o transporte dos convidados",
    categoria: "transporte",
  },
  {
    mesesAntes: 4,
    titulo: "Verificar validade de documentos e passaportes",
    categoria: "documentacao",
  },
  { mesesAntes: 4, titulo: "Encomendar as lembrancinhas", categoria: "lembrancinhas" },
  // 3 meses antes
  { mesesAntes: 3, titulo: "Segunda prova do vestido", categoria: "vestuario" },
  { mesesAntes: 3, titulo: "Montar o mapa de mesas preliminar", categoria: "outros" },
  {
    mesesAntes: 3,
    titulo: "Definir o roteiro da cerimônia com o celebrante",
    categoria: "cerimonial",
  },
  { mesesAntes: 3, titulo: "Escrever os votos", categoria: "cerimonial" },
  { mesesAntes: 3, titulo: "Organizar a despedida de solteira", categoria: "outros" },
  {
    mesesAntes: 3,
    titulo: "Confirmar todos os fornecedores por escrito",
    categoria: "outros",
  },
  // 2 meses antes
  { mesesAntes: 2, titulo: "Cobrar RSVP de quem não respondeu", categoria: "outros" },
  {
    mesesAntes: 2,
    titulo: "Montar o cronograma completo do dia",
    categoria: "cerimonial",
  },
  {
    mesesAntes: 2,
    titulo: "Terceira prova do vestido e ajustes finais",
    categoria: "vestuario",
  },
  { mesesAntes: 2, titulo: "Comprar sapatos, véu e acessórios", categoria: "vestuario" },
  {
    mesesAntes: 2,
    titulo: "Confirmar pagamentos e parcelas pendentes",
    categoria: "outros",
  },
  { mesesAntes: 2, titulo: "Ensaiar a entrada e a valsa", categoria: "musica" },
  // 1 mês antes
  {
    mesesAntes: 1,
    titulo: "Fechar o número final de convidados com o buffet",
    categoria: "buffet",
  },
  { mesesAntes: 1, titulo: "Finalizar o mapa de mesas", categoria: "outros" },
  {
    mesesAntes: 1,
    titulo: "Enviar cronograma e contatos ao cerimonial",
    categoria: "cerimonial",
  },
  { mesesAntes: 1, titulo: "Prova final do vestido", categoria: "vestuario" },
  {
    mesesAntes: 1,
    titulo: "Alinhar trajes e funções com padrinhos",
    categoria: "vestuario",
  },
  { mesesAntes: 1, titulo: "Preparar o kit emergência do dia", categoria: "outros" },
  { mesesAntes: 1, titulo: "Fazer as malas da lua de mel", categoria: "lua_de_mel" },
  // 1 semana antes — mesesAntes 0 é tratado como "7 dias antes" no cálculo
  // do prazo (ver calcularPrazoTarefa em src/actions/onboarding.ts)
  {
    mesesAntes: 0,
    titulo: "Confirmar horários com todos os fornecedores",
    categoria: "outros",
  },
  {
    mesesAntes: 0,
    titulo: "Separar pagamentos e gorjetas em envelopes",
    categoria: "outros",
  },
  {
    mesesAntes: 0,
    titulo: "Entregar a lista de fotos essenciais ao fotógrafo",
    categoria: "fotografia",
  },
  { mesesAntes: 0, titulo: "Descansar, hidratar e dormir bem", categoria: "beleza" },
  {
    mesesAntes: 0,
    titulo: "Deixar documentos e alianças separados",
    categoria: "documentacao",
  },
]
