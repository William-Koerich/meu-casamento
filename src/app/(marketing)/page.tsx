import { NOME_PRODUTO } from "@/lib/site"

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-muted-foreground text-sm tracking-widest uppercase">
        {NOME_PRODUTO}
      </p>
      <h1 className="font-heading max-w-xl text-4xl">
        O planejamento do seu casamento, com calma e em um só lugar.
      </h1>
      <p className="text-muted-foreground max-w-md">
        A landing completa chega na fase de marketing. Por enquanto, a fundação do produto
        está sendo construída.
      </p>
    </main>
  )
}
