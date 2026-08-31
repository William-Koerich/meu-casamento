const DORES = [
  "Planilha em uma aba, orçamento em outra, lista de convidados no papel.",
  "Grupo de WhatsApp lotado de recados que somem na rolagem.",
  "Ninguém sabe ao certo o que já foi pago e o que ainda falta.",
  "Cada pessoa da equipe (noivo, madrinhas, cerimonialista) só vê um pedaço da história.",
]

export function PainSection() {
  return (
    <section className="bg-secondary/40 border-border border-y">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="font-heading text-center text-3xl">
          Planejar um casamento é bonito. Organizar tudo, nem sempre.
        </h2>
        <ul className="text-muted-foreground mx-auto mt-8 max-w-lg space-y-3 text-left">
          {DORES.map((dor) => (
            <li key={dor} className="border-border border-l-2 pl-4">
              {dor}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
