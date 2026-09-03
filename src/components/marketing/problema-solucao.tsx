import { Check, X } from "lucide-react"

import { NOME_PRODUTO } from "@/lib/site"

const ANTES = [
  "Planilha em uma aba, orçamento em outra, lista de convidados no papel",
  "Grupo de WhatsApp lotado de recados que somem na rolagem",
  "Ninguém sabe ao certo o que já foi pago e o que ainda falta",
  "Cada pessoa da equipe só vê um pedaço da história",
]

const DEPOIS = [
  "Checklist, orçamento e convidados no mesmo lugar, sempre atualizados",
  "Equipe com acesso próprio — noivo, madrinhas e cerimonialista, sem duplicar recado",
  "Previsto, contratado e pago visíveis num só olhar, com gráfico e alerta",
  "RSVP com um link, direto na página do casamento",
]

export function ProblemaSolucao() {
  return (
    <section className="bg-secondary/40 border-border border-y">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="font-heading text-center text-3xl sm:text-4xl">
          Planejar um casamento é lindo.
          <br className="hidden sm:block" /> Organizar tudo, nem sempre.
        </h2>

        <div className="border-border bg-card mt-12 grid grid-cols-1 overflow-hidden rounded-2xl border shadow-sm sm:grid-cols-2">
          <div className="p-8 sm:p-10">
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
              Sem o <span className="text-foreground">{NOME_PRODUTO}</span>
            </p>
            <ul className="mt-6 space-y-4">
              {ANTES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="bg-destructive/10 text-destructive mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                    <X className="size-3" strokeWidth={2.5} />
                  </span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 border-border border-t p-8 sm:border-t-0 sm:border-l sm:p-10">
            <p className="text-primary text-sm font-medium tracking-widest uppercase">
              Com o {NOME_PRODUTO}
            </p>
            <ul className="mt-6 space-y-4">
              {DEPOIS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="bg-primary/15 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="size-3" strokeWidth={2.5} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
