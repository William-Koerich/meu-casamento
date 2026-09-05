import Link from "next/link"

import { ProgressRing } from "@/components/app/progress-ring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

type BudgetCardProps = {
  previsto: number
  contratado: number
  pago: number
}

export function BudgetCard({ previsto, contratado, pago }: BudgetCardProps) {
  const percentualPago = previsto > 0 ? Math.round((pago / previsto) * 100) : 0
  const estourou = contratado > previsto && previsto > 0

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
            <div className="flex items-center gap-4">
              <ProgressRing percentual={percentualPago} destaque={estourou} />
              <dl className="grid flex-1 grid-cols-3 gap-2 text-center">
                <div>
                  <dt className="text-muted-foreground text-xs">Previsto</dt>
                  <dd className="text-sm font-medium">{formatCurrency(previsto)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Contratado</dt>
                  <dd
                    className={cn("text-sm font-medium", estourou && "text-destructive")}
                  >
                    {formatCurrency(contratado)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Pago</dt>
                  <dd className="text-sm font-medium">{formatCurrency(pago)}</dd>
                </div>
              </dl>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
