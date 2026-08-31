import {
  CalendarClock,
  Gift,
  ListChecks,
  Music,
  Store,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react"

const FUNCIONALIDADES = [
  {
    titulo: "Checklist de 12 meses",
    descricao: "Gerado automaticamente a partir da data do seu casamento.",
    icone: ListChecks,
  },
  {
    titulo: "Orçamento",
    descricao: "Previsto, contratado e pago por categoria, com gráficos e alertas.",
    icone: Wallet,
  },
  {
    titulo: "Fornecedores",
    descricao: "Compare propostas e acompanhe contratos e pagamentos.",
    icone: Store,
  },
  {
    titulo: "Convidados e mesas",
    descricao: "RSVP, restrições alimentares e mapa de mesas por arrastar e soltar.",
    icone: Users,
  },
  {
    titulo: "Cronograma do dia",
    descricao: "Hora a hora, pronto para enviar ao cerimonial.",
    icone: CalendarClock,
  },
  {
    titulo: "Playlist",
    descricao: "Música por momento da cerimônia e da festa, com exportação para o DJ.",
    icone: Music,
  },
  {
    titulo: "Lista de presentes",
    descricao: "Com reserva pelos convidados e chave Pix.",
    icone: Gift,
  },
  {
    titulo: "Equipe colaborativa",
    descricao: "Convide noivo, madrinhas e cerimonialista com permissões próprias.",
    icone: UserPlus,
  },
]

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="font-heading text-center text-3xl">
        Tudo que o seu casamento precisa
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {FUNCIONALIDADES.map((item) => (
          <div key={item.titulo}>
            <item.icone className="text-primary size-5" strokeWidth={1.5} />
            <h3 className="font-heading mt-3 text-lg">{item.titulo}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{item.descricao}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
