const DEPOIMENTOS = [
  {
    citacao:
      "Finalmente parei de abrir cinco planilhas diferentes. Meu noivo e minha madrinha entram e veem tudo também.",
    autor: "Noiva",
  },
  {
    citacao:
      "Uso com todas as noivas que assessoro — o cronograma do dia sai pronto pra imprimir.",
    autor: "Cerimonialista",
  },
  {
    citacao: "O mapa de mesas por arrastar e soltar economizou horas perto da data.",
    autor: "Noivo",
  },
]

export function SocialProof() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="font-heading text-center text-3xl">Quem planeja, recomenda</h2>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {DEPOIMENTOS.map((depoimento) => (
          <figure key={depoimento.autor} className="border-border border-t pt-4">
            <blockquote className="text-sm leading-relaxed">
              &ldquo;{depoimento.citacao}&rdquo;
            </blockquote>
            <figcaption className="text-muted-foreground mt-3 text-xs tracking-widest uppercase">
              {depoimento.autor}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
