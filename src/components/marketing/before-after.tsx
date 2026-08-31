const ANTES = [
  "Planilhas espalhadas em abas diferentes",
  "Recados perdidos no grupo de WhatsApp",
  "Ninguém sabe o que já foi pago",
  "Cada convidado responde por um canal diferente",
]

const DEPOIS = [
  "Checklist, orçamento e convidados em um só lugar",
  "Equipe com acesso próprio, sem duplicar recado",
  "Previsto, contratado e pago sempre visíveis",
  "RSVP com um link, direto na página do casamento",
]

export function BeforeAfter() {
  return (
    <section className="bg-secondary/40 border-border border-y">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="font-heading text-center text-3xl">Antes e depois</h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-muted-foreground text-sm tracking-widest uppercase">
              Antes
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {ANTES.map((item) => (
                <li key={item} className="border-border border-l-2 pl-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-primary text-sm tracking-widest uppercase">Depois</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {DEPOIS.map((item) => (
                <li key={item} className="border-primary border-l-2 pl-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
