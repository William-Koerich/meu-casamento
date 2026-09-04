import { Quote } from "lucide-react"

const DEPOIMENTOS = [
  {
    citacao:
      "Finalmente parei de abrir cinco planilhas diferentes. Meu noivo e minha madrinha entram e veem tudo também.",
    autor: "Noiva",
    iniciais: "N",
  },
  {
    citacao:
      "Uso com todas as noivas que assessoro — o cronograma do dia sai pronto pra imprimir.",
    autor: "Cerimonialista",
    iniciais: "C",
  },
  {
    citacao: "O mapa de mesas por arrastar e soltar economizou horas perto da data.",
    autor: "Noivo",
    iniciais: "N",
  },
]

export function SocialProof() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-primary text-center text-sm font-medium tracking-widest uppercase">
        Depoimentos
      </p>
      <h2 className="font-heading mt-2 text-center text-3xl sm:text-4xl">
        Quem planeja, recomenda
      </h2>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {DEPOIMENTOS.map((depoimento) => (
          <figure
            key={depoimento.autor}
            className="border-border bg-card flex flex-col rounded-xl border p-6"
          >
            <Quote
              className="text-primary/20 size-8"
              fill="currentColor"
              strokeWidth={0}
            />
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed">
              {depoimento.citacao}
            </blockquote>
            <figcaption className="border-border mt-5 flex items-center gap-3 border-t pt-4">
              <span className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                {depoimento.iniciais}
              </span>
              <span className="text-muted-foreground text-xs tracking-widest uppercase">
                {depoimento.autor}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
