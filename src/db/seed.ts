import "dotenv/config"

import { createClient } from "@supabase/supabase-js"
import { addDays, format, subDays, subMonths } from "date-fns"

import { db } from "@/db"
import {
  budgetCategories,
  budgetItems,
  documents,
  gifts,
  guests,
  honeymoon,
  inspirations,
  payments,
  songs,
  tables,
  tasks,
  timelineEvents,
  trousseauItems,
  vendors,
  weddingMembers,
  weddings,
  type ChecklistMalaItem,
  type RoteiroDia,
} from "@/db/schema"
import { CHECKLIST_TEMPLATE } from "@/lib/checklist-template"
import { ORCAMENTO_TEMPLATE } from "@/lib/orcamento-template"
import { gerarCodigo, slugify } from "@/lib/utils"

// Data de referência usada só para decidir o que já estaria concluído ou
// atrasado neste casamento de exemplo — não afeta o app em si.
const HOJE = new Date("2026-08-31")
const DATA_CASAMENTO = new Date("2027-05-15")

const dataString = (data: Date) => format(data, "yyyy-MM-dd")

async function limparDados() {
  await db.delete(documents)
  await db.delete(honeymoon)
  await db.delete(trousseauItems)
  await db.delete(gifts)
  await db.delete(songs)
  await db.delete(inspirations)
  await db.delete(timelineEvents)
  await db.delete(guests)
  await db.delete(tables)
  await db.delete(payments)
  await db.delete(budgetItems)
  await db.delete(budgetCategories)
  await db.delete(vendors)
  await db.delete(tasks)
  await db.delete(weddingMembers)
  await db.delete(weddings)
}

async function criarUsuarioDemo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local para rodar o seed " +
        "(a service key só é usada aqui, num script local, nunca no código da aplicação)."
    )
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const email = "mariana@exemplo.com"
  const senha = "SenhaDemo123!"

  const { data: existentes } = await admin.auth.admin.listUsers()
  const jaExiste = existentes?.users.find((usuario) => usuario.email === email)
  if (jaExiste) {
    await admin.auth.admin.deleteUser(jaExiste.id)
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome: "Mariana Alves" },
  })

  if (error || !data.user) {
    throw new Error(`Falha ao criar usuária demo: ${error?.message}`)
  }

  console.log(`Usuária demo criada: ${email} / ${senha}`)
  return data.user.id
}

function calcularPrazo(mesesAntes: number): Date {
  return mesesAntes === 0
    ? subDays(DATA_CASAMENTO, 7)
    : subMonths(DATA_CASAMENTO, mesesAntes)
}

async function seed() {
  console.log("Limpando dados de exemplo anteriores...")
  await limparDados()

  const ownerId = await criarUsuarioDemo()

  console.log("Criando casamento de exemplo...")
  const orcamentoTotal = 80000
  const [wedding] = await db
    .insert(weddings)
    .values({
      ownerId,
      nomeNoiva: "Mariana Alves",
      nomeNoivo: "Rafael Souza",
      dataCasamento: dataString(DATA_CASAMENTO),
      horaCerimonia: "16:30",
      localCerimonia: "Igreja Nossa Senhora do Carmo",
      enderecoCerimonia: "Rua das Flores, 123 - Centro",
      localFesta: "Espaço Villa Bianca",
      enderecoFesta: "Estrada do Vinhedo, km 5",
      cidade: "Bento Gonçalves",
      estado: "RS",
      orcamentoTotal: String(orcamentoTotal),
      convidadosEstimados: 120,
      estilo: "rustico",
      historiaCasal:
        "Mariana e Rafael se conheceram numa vindima em 2021 e nunca mais se separaram. " +
        "Depois de três anos de namoro, o pedido aconteceu no mesmo vinhedo do primeiro encontro.",
      dressCode: "Traje esporte fino",
      slug: slugify("Mariana e Rafael"),
      publicado: true,
    })
    .returning()

  console.log("Criando equipe (convites pendentes)...")
  await db.insert(weddingMembers).values([
    {
      weddingId: wedding.id,
      papel: "noivo",
      permissao: "editor",
      conviteEmail: "rafael@exemplo.com",
      conviteToken: crypto.randomUUID(),
    },
    {
      weddingId: wedding.id,
      papel: "padrinho_madrinha",
      permissao: "leitor",
      conviteEmail: "beatriz@exemplo.com",
      conviteToken: crypto.randomUUID(),
    },
    {
      weddingId: wedding.id,
      papel: "cerimonialista",
      permissao: "editor",
      conviteEmail: "contato@cerimonialmomentos.com.br",
      conviteToken: crypto.randomUUID(),
    },
  ])

  console.log("Criando checklist de 12 meses...")
  await db.insert(tasks).values(
    CHECKLIST_TEMPLATE.map((item, index) => {
      const prazo = calcularPrazo(item.mesesAntes)
      const concluida = prazo < HOJE && index % 5 !== 0
      return {
        weddingId: wedding.id,
        titulo: item.titulo,
        categoria: item.categoria,
        mesesAntes: item.mesesAntes,
        prazo: dataString(prazo),
        concluida,
        concluidaEm: concluida ? prazo : null,
        ordem: index,
        origem: "template" as const,
      }
    })
  )

  console.log("Criando fornecedores...")
  const [
    fornecedorLocal,
    fornecedorBuffet,
    fornecedorDecoracao,
    fornecedorFotografia,
    ,
    fornecedorMusica,
    fornecedorBolo,
  ] = await db
    .insert(vendors)
    .values([
      {
        weddingId: wedding.id,
        nome: "Espaço Villa Bianca",
        categoria: "local",
        contatoNome: "Carla Mendes",
        telefone: "(54) 99988-7766",
        email: "contato@villabianca.com.br",
        status: "contratado",
        valorProposto: "12000",
        avaliacao: 5,
      },
      {
        weddingId: wedding.id,
        nome: "Sabor & Arte Buffet",
        categoria: "buffet",
        contatoNome: "João Pedro Lima",
        telefone: "(54) 99877-6655",
        email: "comercial@saborarte.com.br",
        status: "contratado",
        valorProposto: "23500",
        avaliacao: 5,
      },
      {
        weddingId: wedding.id,
        nome: "Flora Encantada Decorações",
        categoria: "decoracao",
        contatoNome: "Renata Silva",
        telefone: "(54) 99766-5544",
        instagram: "@floraencantada",
        status: "proposta_recebida",
        valorProposto: "7800",
        avaliacao: 4,
      },
      {
        weddingId: wedding.id,
        nome: "Estúdio Luz Natural",
        categoria: "fotografia",
        contatoNome: "Pedro Augusto",
        telefone: "(54) 99655-4433",
        instagram: "@luznaturalfotos",
        status: "contratado",
        valorProposto: "7500",
        avaliacao: 5,
      },
      {
        weddingId: wedding.id,
        nome: "Ateliê Bela Noiva",
        categoria: "vestuario",
        contatoNome: "Sônia Ferreira",
        telefone: "(54) 99544-3322",
        status: "pesquisando",
        observacoes: "Visitar o ateliê em outubro para prova de coleções.",
      },
      {
        weddingId: wedding.id,
        nome: "Banda Sinfonia Popular",
        categoria: "musica",
        contatoNome: "Marcelo Duarte",
        telefone: "(54) 99433-2211",
        status: "contatado",
        valorProposto: "6200",
        avaliacao: 4,
      },
      {
        weddingId: wedding.id,
        nome: "Doce Encanto Bolos",
        categoria: "bolo_doces",
        contatoNome: "Luísa Cardoso",
        telefone: "(54) 99322-1100",
        status: "contratado",
        valorProposto: "3100",
        avaliacao: 5,
      },
      {
        weddingId: wedding.id,
        nome: "Convites & Cia",
        categoria: "convites",
        status: "descartado",
        observacoes: "Orçamento acima do previsto, buscar outra opção.",
      },
      {
        weddingId: wedding.id,
        nome: "Cerimonial Momentos",
        categoria: "cerimonial",
        contatoNome: "Fernanda Lopes",
        telefone: "(54) 99211-0099",
        status: "contratado",
        valorProposto: "3000",
        avaliacao: 5,
      },
      {
        weddingId: wedding.id,
        nome: "Transporte VIP Eventos",
        categoria: "transporte",
        status: "pesquisando",
      },
    ])
    .returning()

  console.log("Criando categorias de orçamento...")
  const categoriasCriadas = await db
    .insert(budgetCategories)
    .values(
      ORCAMENTO_TEMPLATE.map(({ nome, percentual, cor }, ordem) => ({
        weddingId: wedding.id,
        nome,
        valorPrevisto: String((orcamentoTotal * percentual) / 100),
        cor,
        ordem,
      }))
    )
    .returning()

  const categoriaPorNome = Object.fromEntries(categoriasCriadas.map((c) => [c.nome, c]))

  console.log("Criando itens de orçamento e pagamentos...")
  const itensOrcamento = await db
    .insert(budgetItems)
    .values([
      {
        weddingId: wedding.id,
        categoryId: categoriaPorNome["Local"].id,
        vendorId: fornecedorLocal.id,
        descricao: "Aluguel do espaço Villa Bianca",
        valorPrevisto: "12000",
        valorContratado: "12000",
      },
      {
        weddingId: wedding.id,
        categoryId: categoriaPorNome["Buffet"].id,
        vendorId: fornecedorBuffet.id,
        descricao: "Buffet completo para 120 convidados",
        valorPrevisto: "24000",
        valorContratado: "23500",
      },
      {
        weddingId: wedding.id,
        categoryId: categoriaPorNome["Decoração e flores"].id,
        vendorId: fornecedorDecoracao.id,
        descricao: "Decoração floral cerimônia e festa",
        valorPrevisto: "8000",
        valorContratado: null,
      },
      {
        weddingId: wedding.id,
        categoryId: categoriaPorNome["Fotografia e vídeo"].id,
        vendorId: fornecedorFotografia.id,
        descricao: "Cobertura fotográfica do dia",
        valorPrevisto: "8000",
        valorContratado: "7500",
      },
      {
        weddingId: wedding.id,
        categoryId: categoriaPorNome["Música"].id,
        vendorId: fornecedorMusica.id,
        descricao: "Banda para a recepção",
        valorPrevisto: "6400",
        valorContratado: null,
      },
      {
        weddingId: wedding.id,
        categoryId: categoriaPorNome["Bolo e doces"].id,
        vendorId: fornecedorBolo.id,
        descricao: "Bolo e mesa de doces",
        valorPrevisto: "3200",
        valorContratado: "3100",
      },
    ])
    .returning()

  await db.insert(payments).values([
    {
      weddingId: wedding.id,
      budgetItemId: itensOrcamento[0].id,
      descricao: "Sinal do espaço",
      valor: "4000",
      vencimento: dataString(subMonths(DATA_CASAMENTO, 10)),
      pago: true,
      pagoEm: subMonths(DATA_CASAMENTO, 10),
      formaPagamento: "pix",
    },
    {
      weddingId: wedding.id,
      budgetItemId: itensOrcamento[0].id,
      descricao: "Parcela final do espaço",
      valor: "8000",
      vencimento: dataString(subMonths(DATA_CASAMENTO, 1)),
      pago: false,
    },
    {
      weddingId: wedding.id,
      budgetItemId: itensOrcamento[1].id,
      descricao: "Sinal do buffet",
      valor: "10000",
      vencimento: dataString(subMonths(DATA_CASAMENTO, 8)),
      pago: true,
      pagoEm: subMonths(DATA_CASAMENTO, 8),
      formaPagamento: "cartao",
    },
    {
      weddingId: wedding.id,
      budgetItemId: itensOrcamento[1].id,
      descricao: "Parcela intermediária do buffet",
      valor: "13500",
      vencimento: dataString(addDays(HOJE, -10)),
      pago: false,
    },
    {
      weddingId: wedding.id,
      budgetItemId: itensOrcamento[3].id,
      descricao: "Sinal da fotografia",
      valor: "3000",
      vencimento: dataString(subMonths(DATA_CASAMENTO, 9)),
      pago: true,
      pagoEm: subMonths(DATA_CASAMENTO, 9),
      formaPagamento: "pix",
    },
    {
      weddingId: wedding.id,
      budgetItemId: itensOrcamento[5].id,
      descricao: "Sinal do bolo",
      valor: "1000",
      vencimento: dataString(addDays(HOJE, 20)),
      pago: false,
    },
  ])

  console.log("Criando mesas e convidados...")
  const mesasCriadas = await db
    .insert(tables)
    .values([
      {
        weddingId: wedding.id,
        nome: "Mesa dos noivos",
        capacidade: 2,
        formato: "redonda",
      },
      { weddingId: wedding.id, nome: "Mesa 1", capacidade: 8, formato: "redonda" },
      { weddingId: wedding.id, nome: "Mesa 2", capacidade: 8, formato: "redonda" },
      {
        weddingId: wedding.id,
        nome: "Mesa da família",
        capacidade: 10,
        formato: "imperial",
      },
    ])
    .returning()

  const convidadosBase: {
    nome: string
    grupo: (typeof guests.$inferInsert)["grupo"]
    lado: (typeof guests.$inferInsert)["lado"]
    statusRsvp: (typeof guests.$inferInsert)["statusRsvp"]
    acompanhantes?: number
    tableId?: string
  }[] = [
    {
      nome: "Beatriz Alves",
      grupo: "familia_noiva",
      lado: "noiva",
      statusRsvp: "confirmado",
      tableId: mesasCriadas[3].id,
    },
    {
      nome: "Carlos Alves",
      grupo: "familia_noiva",
      lado: "noiva",
      statusRsvp: "confirmado",
      tableId: mesasCriadas[3].id,
    },
    {
      nome: "Fernanda Souza",
      grupo: "familia_noivo",
      lado: "noivo",
      statusRsvp: "confirmado",
      tableId: mesasCriadas[3].id,
    },
    {
      nome: "Roberto Souza",
      grupo: "familia_noivo",
      lado: "noivo",
      statusRsvp: "pendente",
    },
    {
      nome: "Juliana Prado",
      grupo: "amigos_noiva",
      lado: "noiva",
      statusRsvp: "confirmado",
      acompanhantes: 1,
      tableId: mesasCriadas[1].id,
    },
    {
      nome: "Camila Rocha",
      grupo: "amigos_noiva",
      lado: "noiva",
      statusRsvp: "confirmado",
      tableId: mesasCriadas[1].id,
    },
    {
      nome: "Larissa Nunes",
      grupo: "amigos_noiva",
      lado: "noiva",
      statusRsvp: "recusado",
    },
    {
      nome: "Diego Martins",
      grupo: "amigos_noivo",
      lado: "noivo",
      statusRsvp: "confirmado",
      acompanhantes: 1,
      tableId: mesasCriadas[2].id,
    },
    {
      nome: "Thiago Ramos",
      grupo: "amigos_noivo",
      lado: "noivo",
      statusRsvp: "confirmado",
      tableId: mesasCriadas[2].id,
    },
    {
      nome: "Bruno Castro",
      grupo: "amigos_noivo",
      lado: "noivo",
      statusRsvp: "pendente",
    },
    { nome: "Patrícia Gomes", grupo: "trabalho", lado: "ambos", statusRsvp: "pendente" },
    {
      nome: "André Villela",
      grupo: "trabalho",
      lado: "ambos",
      statusRsvp: "confirmado",
      tableId: mesasCriadas[1].id,
    },
    { nome: "Simone Barros", grupo: "outros", lado: "ambos", statusRsvp: "pendente" },
    {
      nome: "Eduardo Faria",
      grupo: "familia_noiva",
      lado: "noiva",
      statusRsvp: "confirmado",
      tableId: mesasCriadas[3].id,
    },
    {
      nome: "Vanessa Lima",
      grupo: "familia_noivo",
      lado: "noivo",
      statusRsvp: "recusado",
    },
    {
      nome: "Rodrigo Peixoto",
      grupo: "amigos_noivo",
      lado: "noivo",
      statusRsvp: "confirmado",
      tableId: mesasCriadas[2].id,
    },
    {
      nome: "Aline Cordeiro",
      grupo: "amigos_noiva",
      lado: "noiva",
      statusRsvp: "pendente",
    },
    {
      nome: "Marcos Vieira",
      grupo: "trabalho",
      lado: "ambos",
      statusRsvp: "confirmado",
      tableId: mesasCriadas[1].id,
    },
  ]

  const codigosUsados = new Set<string>()
  const gerarCodigoUnico = () => {
    let codigo = gerarCodigo()
    while (codigosUsados.has(codigo)) codigo = gerarCodigo()
    codigosUsados.add(codigo)
    return codigo
  }

  await db.insert(guests).values(
    convidadosBase.map((convidado) => ({
      weddingId: wedding.id,
      nome: convidado.nome,
      grupo: convidado.grupo,
      lado: convidado.lado,
      statusRsvp: convidado.statusRsvp,
      acompanhantes: convidado.acompanhantes ?? 0,
      tableId: convidado.tableId ?? null,
      respondidoEm: convidado.statusRsvp !== "pendente" ? subDays(HOJE, 15) : null,
      codigoRsvp: gerarCodigoUnico(),
    }))
  )

  console.log("Criando cronograma do dia...")
  await db.insert(timelineEvents).values([
    {
      weddingId: wedding.id,
      horario: "15:30",
      duracaoMinutos: 30,
      titulo: "Chegada dos convidados",
      responsavel: "Cerimonial Momentos",
      local: "Igreja Nossa Senhora do Carmo",
      ordem: 0,
    },
    {
      weddingId: wedding.id,
      horario: "16:00",
      duracaoMinutos: 15,
      titulo: "Entrada dos padrinhos",
      local: "Igreja Nossa Senhora do Carmo",
      ordem: 1,
    },
    {
      weddingId: wedding.id,
      horario: "16:15",
      duracaoMinutos: 15,
      titulo: "Entrada da noiva",
      local: "Igreja Nossa Senhora do Carmo",
      ordem: 2,
    },
    {
      weddingId: wedding.id,
      horario: "16:30",
      duracaoMinutos: 60,
      titulo: "Cerimônia religiosa",
      responsavel: "Padre Antônio",
      local: "Igreja Nossa Senhora do Carmo",
      ordem: 3,
    },
    {
      weddingId: wedding.id,
      horario: "17:30",
      duracaoMinutos: 60,
      titulo: "Sessão de fotos",
      responsavel: "Estúdio Luz Natural",
      ordem: 4,
    },
    {
      weddingId: wedding.id,
      horario: "19:00",
      duracaoMinutos: 30,
      titulo: "Recepção dos convidados na festa",
      local: "Espaço Villa Bianca",
      ordem: 5,
    },
    {
      weddingId: wedding.id,
      horario: "19:30",
      duracaoMinutos: 30,
      titulo: "Entrada dos noivos na festa",
      ordem: 6,
    },
    {
      weddingId: wedding.id,
      horario: "20:00",
      duracaoMinutos: 60,
      titulo: "Jantar",
      responsavel: "Sabor & Arte Buffet",
      ordem: 7,
    },
    {
      weddingId: wedding.id,
      horario: "21:00",
      duracaoMinutos: 15,
      titulo: "Corte do bolo",
      responsavel: "Doce Encanto Bolos",
      ordem: 8,
    },
    {
      weddingId: wedding.id,
      horario: "21:30",
      duracaoMinutos: 150,
      titulo: "Festa e valsa",
      responsavel: "Banda Sinfonia Popular",
      ordem: 9,
    },
  ])

  console.log("Criando inspirações, playlist, presentes e enxoval...")
  await db.insert(inspirations).values([
    {
      weddingId: wedding.id,
      titulo: "Decoração de mesa rústica",
      categoria: "decoracao",
      notas: "Toalhas de linho, velas e flores do campo.",
    },
    {
      weddingId: wedding.id,
      titulo: "Buquê de campo",
      categoria: "vestuario",
      notas: "Buquê com eucalipto e flores silvestres.",
    },
    {
      weddingId: wedding.id,
      titulo: "Iluminação com luzes de fada",
      categoria: "decoracao",
      linkExterno: "https://exemplo.com/inspiracao-luzes",
    },
    {
      weddingId: wedding.id,
      titulo: "Vestido em renda com mangas longas",
      categoria: "vestuario",
    },
    {
      weddingId: wedding.id,
      titulo: "Mesa de doces rústica",
      categoria: "bolo_doces",
      notas: "Mesa de madeira com toalha de juta.",
    },
  ])

  await db.insert(songs).values([
    {
      weddingId: wedding.id,
      titulo: "Canon in D",
      artista: "Johann Pachelbel",
      momento: "entrada_padrinhos",
      ordem: 0,
    },
    {
      weddingId: wedding.id,
      titulo: "A Thousand Years",
      artista: "Christina Perri",
      momento: "entrada_noiva",
      ordem: 1,
    },
    {
      weddingId: wedding.id,
      titulo: "Perfect",
      artista: "Ed Sheeran",
      momento: "valsa",
      ordem: 2,
    },
    {
      weddingId: wedding.id,
      titulo: "Can't Help Falling in Love",
      artista: "Elvis Presley",
      momento: "saida",
      ordem: 3,
    },
    {
      weddingId: wedding.id,
      titulo: "Evidências",
      artista: "Chitãozinho & Xororó",
      momento: "festa",
      ordem: 4,
    },
    {
      weddingId: wedding.id,
      titulo: "Ai Se Eu Te Pego",
      artista: "Michel Teló",
      momento: "nunca_tocar",
      ordem: 5,
    },
  ])

  await db.insert(gifts).values([
    {
      weddingId: wedding.id,
      nome: "Jogo de panelas antiaderentes",
      preco: "899",
      linkLoja: "https://exemplo.com/panelas",
      recebido: false,
    },
    {
      weddingId: wedding.id,
      nome: "Liquidificador",
      preco: "349",
      reservadoPorNome: "Camila Rocha",
      reservadoPorEmail: "camila@exemplo.com",
      reservadoEm: subDays(HOJE, 5),
      recebido: false,
    },
    {
      weddingId: wedding.id,
      nome: "Jogo de cama king size",
      preco: "620",
      recebido: false,
    },
    {
      weddingId: wedding.id,
      nome: "Cota lua de mel",
      descricao: "Ajude a compor a viagem dos sonhos",
      preco: "200",
      chavePix: "mariana.rafael@exemplo.com",
      recebido: false,
    },
    {
      weddingId: wedding.id,
      nome: "Cafeteira elétrica",
      preco: "459",
      reservadoPorNome: "Juliana Prado",
      reservadoPorEmail: "juliana@exemplo.com",
      reservadoEm: subDays(HOJE, 30),
      recebido: true,
    },
  ])

  await db.insert(trousseauItems).values([
    {
      weddingId: wedding.id,
      nome: "Panela de pressão",
      comodo: "cozinha",
      prioridade: "alta",
    },
    {
      weddingId: wedding.id,
      nome: "Jogo de facas",
      comodo: "cozinha",
      prioridade: "media",
      precoEstimado: "180",
    },
    {
      weddingId: wedding.id,
      nome: "Sofá 3 lugares",
      comodo: "sala",
      prioridade: "alta",
      precoEstimado: "2800",
      comprado: true,
    },
    { weddingId: wedding.id, nome: "Rack para TV", comodo: "sala", prioridade: "baixa" },
    {
      weddingId: wedding.id,
      nome: "Colchão queen",
      comodo: "quarto",
      prioridade: "alta",
      precoEstimado: "1900",
      comprado: true,
    },
    {
      weddingId: wedding.id,
      nome: "Guarda-roupa casal",
      comodo: "quarto",
      prioridade: "alta",
    },
    {
      weddingId: wedding.id,
      nome: "Máquina de lavar",
      comodo: "lavanderia",
      prioridade: "alta",
      precoEstimado: "2200",
    },
    {
      weddingId: wedding.id,
      nome: "Kit toalhas",
      comodo: "banheiro",
      prioridade: "media",
    },
    {
      weddingId: wedding.id,
      nome: "Churrasqueira portátil",
      comodo: "area_externa",
      prioridade: "baixa",
    },
  ])

  console.log("Criando lua de mel...")
  const roteiro: RoteiroDia[] = [
    {
      dia: 1,
      titulo: "Chegada em Lisboa",
      atividades: "Check-in e jantar no Bairro Alto.",
    },
    {
      dia: 2,
      titulo: "Sintra",
      atividades: "Passeio pelo Palácio da Pena e Quinta da Regaleira.",
    },
    {
      dia: 3,
      titulo: "Lisboa histórica",
      atividades: "Belém, torre de Belém e pastéis de nata.",
    },
    { dia: 4, titulo: "Ida ao Porto", atividades: "Viagem de trem e check-in no Porto." },
    {
      dia: 5,
      titulo: "Vale do Douro",
      atividades: "Passeio de barco e degustação de vinhos.",
    },
  ]
  const checklistMala: ChecklistMalaItem[] = [
    { item: "Passaportes", marcado: false },
    { item: "Câmera fotográfica", marcado: false },
    { item: "Roupas leves e casaco para a noite", marcado: false },
    { item: "Adaptador de tomada", marcado: false },
    { item: "Seguro viagem impresso", marcado: false },
  ]

  await db.insert(honeymoon).values({
    weddingId: wedding.id,
    destino: "Lisboa e Porto, Portugal",
    dataIda: dataString(addDays(DATA_CASAMENTO, 3)),
    dataVolta: dataString(addDays(DATA_CASAMENTO, 13)),
    orcamento: "18000",
    roteiro,
    checklistMala,
  })

  console.log("Criando documentos...")
  await db.insert(documents).values([
    {
      weddingId: wedding.id,
      nome: "Contrato - Espaço Villa Bianca",
      tipo: "contrato",
      arquivoUrl: `documentos/${wedding.id}/contrato-villa-bianca.pdf`,
      vendorId: fornecedorLocal.id,
    },
    {
      weddingId: wedding.id,
      nome: "Contrato - Sabor & Arte Buffet",
      tipo: "contrato",
      arquivoUrl: `documentos/${wedding.id}/contrato-buffet.pdf`,
      vendorId: fornecedorBuffet.id,
    },
    {
      weddingId: wedding.id,
      nome: "Recibo - sinal da fotografia",
      tipo: "recibo",
      arquivoUrl: `documentos/${wedding.id}/recibo-fotografia.pdf`,
      vendorId: fornecedorFotografia.id,
    },
    {
      weddingId: wedding.id,
      nome: "Certidão de nascimento - Mariana",
      tipo: "certidao",
      arquivoUrl: `documentos/${wedding.id}/certidao-mariana.pdf`,
    },
  ])

  console.log("Seed concluído com sucesso!")
  console.log(
    `Casamento: ${wedding.nomeNoiva} & ${wedding.nomeNoivo} — slug "${wedding.slug}"`
  )
}

seed()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => process.exit(0))
