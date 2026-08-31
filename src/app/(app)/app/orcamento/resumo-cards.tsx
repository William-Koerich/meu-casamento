import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

type ResumoCardsProps = {
  previsto: number
  contratado: number
  pago: number
  saldo: number
}

export function ResumoCards({ previsto, contratado, pago, saldo }: ResumoCardsProps) {
  const estourou = contratado > previsto && previsto > 0

  const itens = [
    { rotulo: "Previsto", valor: previsto },
    { rotulo: "Contratado", valor: contratado, destaque: estourou },
    { rotulo: "Pago", valor: pago },
    { rotulo: "Saldo", valor: saldo },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {itens.map((item) => (
        <Card key={item.rotulo}>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-xs">{item.rotulo}</p>
            <p
              className={cn(
                "mt-1 text-xl font-medium",
                item.destaque && "text-destructive"
              )}
            >
              {formatCurrency(item.valor)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
