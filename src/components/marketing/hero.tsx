import Link from "next/link"
import { Check, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NOME_PRODUTO } from "@/lib/site"

const CONFIANCA = [
  "Cadastro em 2 minutos",
  "Sem cartão pra começar",
  "Seus dados, sua conta",
]

function PreviaPainel() {
  return (
    <div className="border-border bg-card mx-auto w-full max-w-sm rounded-2xl border p-1.5 shadow-lg shadow-black/5">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="bg-destructive/40 size-2.5 rounded-full" />
        <span className="size-2.5 rounded-full bg-[#e3c368]" />
        <span className="bg-primary/50 size-2.5 rounded-full" />
      </div>
      <div className="border-border bg-background space-y-4 rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-sm">Maria & William</p>
          <span className="text-muted-foreground text-xs">128 dias</span>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="relative size-16 shrink-0 rounded-full"
            style={{
              background: `conic-gradient(var(--primary) 68%, var(--accent) 0)`,
            }}
          >
            <div className="bg-background absolute inset-1 flex items-center justify-center rounded-full">
              <span className="text-sm font-medium">68%</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Check className="text-primary size-3.5" />
              <span className="text-muted-foreground">Fechar local da festa</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Check className="text-primary size-3.5" />
              <span className="text-muted-foreground">Enviar convites</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="border-muted-foreground/40 size-3.5 rounded-sm border" />
              <span>Provar o vestido</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Orçamento</span>
            <span className="font-medium">R$ 32.400 / 45.000</span>
          </div>
          <div className="bg-accent h-1.5 overflow-hidden rounded-full">
            <div className="bg-primary h-full w-[72%] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="from-primary/15 via-background to-background pointer-events-none absolute inset-0 bg-gradient-to-br"
      />
      <div
        aria-hidden
        className="bg-primary/20 pointer-events-none absolute top-0 -right-40 size-[32rem] rounded-full blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase">
            <Sparkles className="size-3.5" />
            {NOME_PRODUTO}
          </span>
          <h1 className="font-heading mt-5 text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            O casamento dos seus sonhos, <span className="text-primary italic">sem</span>{" "}
            planilha nenhuma.
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-lg text-lg lg:mx-0">
            Checklist, orçamento, convidados, fornecedores e equipe — tudo num só lugar,
            organizado do jeito que a Pinterest promete e o WhatsApp nunca entrega.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button asChild size="lg" className="text-base">
              <Link href="/cadastro">Começar agora</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="/precos">Ver planos</Link>
            </Button>
          </div>
          <ul className="text-muted-foreground mt-8 flex flex-col justify-center gap-x-6 gap-y-2 text-sm sm:flex-row lg:justify-start">
            {CONFIANCA.map((item) => (
              <li
                key={item}
                className="flex items-center justify-center gap-1.5 lg:justify-start"
              >
                <Check className="text-primary size-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <PreviaPainel />
      </div>
    </section>
  )
}
