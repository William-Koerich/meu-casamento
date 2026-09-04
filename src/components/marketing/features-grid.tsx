import {
  CalendarClock,
  Gift,
  Globe,
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

function SpotlightCard() {
  return (
    <div className="border-border bg-card flex flex-col gap-6 rounded-xl border p-6 sm:col-span-2 sm:flex-row sm:items-center">
      <div className="flex-1">
        <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
          <Globe className="size-5" strokeWidth={1.5} />
        </span>
        <h3 className="font-heading mt-4 text-lg">Site público do casal</h3>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Monte a página do seu casamento arrastando blocos — história, RSVP, presentes,
          local — e compartilhe um link só com todo mundo.
        </p>
      </div>
      <div className="border-border bg-background w-full shrink-0 overflow-hidden rounded-lg border shadow-sm sm:w-56">
        <div className="border-border flex items-center gap-1.5 border-b px-3 py-2">
          <span className="bg-muted-foreground/30 size-2 rounded-full" />
          <span className="bg-muted-foreground/30 size-2 rounded-full" />
          <span className="bg-muted-foreground/30 size-2 rounded-full" />
          <span className="text-muted-foreground ml-1 truncate text-[10px]">
            organiza-meu-casamento.com/c/maria-e-william
          </span>
        </div>
        <div className="from-primary/30 via-accent to-primary/10 h-16 bg-gradient-to-br" />
        <div className="p-3">
          <p className="font-heading text-sm">Maria & William</p>
          <p className="text-muted-foreground text-[10px]">15 de março de 2027</p>
        </div>
      </div>
    </div>
  )
}

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-primary text-center text-sm font-medium tracking-widest uppercase">
        Tudo incluso
      </p>
      <h2 className="font-heading mt-2 text-center text-3xl sm:text-4xl">
        Tudo que o seu casamento precisa
      </h2>
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SpotlightCard />
        {FUNCIONALIDADES.map((item) => (
          <div
            key={item.titulo}
            className="border-border bg-card hover:border-primary/40 group rounded-xl border p-6 transition-colors hover:shadow-sm"
          >
            <span className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-10 items-center justify-center rounded-full transition-colors">
              <item.icone className="size-5" strokeWidth={1.5} />
            </span>
            <h3 className="font-heading mt-4 text-lg">{item.titulo}</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">{item.descricao}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
