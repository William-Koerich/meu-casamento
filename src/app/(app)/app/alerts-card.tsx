import Link from "next/link"
import { CircleAlert, PartyPopper } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AlertsCardProps = {
  tarefasAtrasadas: number
  pagamentosVencendo: number
}

export function AlertsCard({ tarefasAtrasadas, pagamentosVencendo }: AlertsCardProps) {
  const semAlertas = tarefasAtrasadas === 0 && pagamentosVencendo === 0

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Alertas</CardTitle>
      </CardHeader>
      <CardContent>
        {semAlertas ? (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <PartyPopper className="text-primary size-4 shrink-0" />
            Tudo em dia por aqui.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {tarefasAtrasadas > 0 && (
              <li>
                <Link
                  href="/app/checklist"
                  className="text-destructive flex items-center gap-2 hover:underline"
                >
                  <CircleAlert className="size-4 shrink-0" />
                  {tarefasAtrasadas} tarefa{tarefasAtrasadas > 1 ? "s" : ""} atrasada
                  {tarefasAtrasadas > 1 ? "s" : ""}
                </Link>
              </li>
            )}
            {pagamentosVencendo > 0 && (
              <li>
                <Link
                  href="/app/orcamento"
                  className="text-destructive flex items-center gap-2 hover:underline"
                >
                  <CircleAlert className="size-4 shrink-0" />
                  {pagamentosVencendo} pagamento{pagamentosVencendo > 1 ? "s" : ""}{" "}
                  vencendo em 7 dias
                </Link>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
