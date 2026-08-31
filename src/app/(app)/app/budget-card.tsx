import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"

type BudgetCardProps = {
  previsto: number
  contratado: number
  pago: number
}

export function BudgetCard({ previsto, contratado, pago }: BudgetCardProps) {
  return (
    <Link href="/app/orcamento" className="block h-full">
      <Card className="hover:bg-accent/30 h-full transition-colors">
        <CardHeader>
          <CardTitle>Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          {previsto === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma categoria de orçamento cadastrada ainda.
            </p>
          ) : (
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div>
                <dt className="text-muted-foreground text-xs">Previsto</dt>
                <dd className="text-sm font-medium">{formatCurrency(previsto)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Contratado</dt>
                <dd className="text-sm font-medium">{formatCurrency(contratado)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Pago</dt>
                <dd className="text-sm font-medium">{formatCurrency(pago)}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
