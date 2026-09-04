import { ListChecks, PartyPopper, UsersRound } from "lucide-react"

const PASSOS = [
  {
    numero: "1",
    titulo: "Conte sobre o casamento",
    descricao: "Nomes, data, estilo e orçamento aproximado — leva 2 minutos.",
    icone: PartyPopper,
  },
  {
    numero: "2",
    titulo: "Receba tudo pronto",
    descricao: "Checklist de 12 meses e categorias de orçamento geradas na hora.",
    icone: ListChecks,
  },
  {
    numero: "3",
    titulo: "Organize com sua equipe",
    descricao: "Convide noivo, madrinhas e cerimonialista, cada um com sua permissão.",
    icone: UsersRound,
  },
]

export function ComoFunciona() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-primary text-center text-sm font-medium tracking-widest uppercase">
        Como funciona
      </p>
      <h2 className="font-heading mt-2 text-center text-3xl sm:text-4xl">
        Do zero ao planejamento organizado
      </h2>
      <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
        <div
          aria-hidden
          className="bg-border absolute top-7 right-0 left-0 hidden h-px sm:block"
        />
        {PASSOS.map((passo) => (
          <div
            key={passo.numero}
            className="relative flex flex-col items-center text-center"
          >
            <span className="bg-primary text-primary-foreground font-heading relative z-10 flex size-14 items-center justify-center rounded-full text-lg">
              {passo.numero}
            </span>
            <span className="bg-primary/10 text-primary mt-5 flex size-9 items-center justify-center rounded-full">
              <passo.icone className="size-4" strokeWidth={1.5} />
            </span>
            <h3 className="font-heading mt-3 text-lg">{passo.titulo}</h3>
            <p className="text-muted-foreground mt-1.5 max-w-[16rem] text-sm">
              {passo.descricao}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
