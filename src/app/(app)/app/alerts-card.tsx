import Link from "next/link"
import { CircleAlert, PartyPopper } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AlertsCardProps = {
  tarefasAtrasadas: number
  pagamentosVencidos: number
  pagamentosVencendo: number
}

export function AlertsCard({
  tarefasAtrasadas,
  pagamentosVencidos,
  pagamentosVencendo,
}: AlertsCardProps) {
  const total = tarefasAtrasadas + pagamentosVencidos + pagamentosVencendo
  const semAlertas = total === 0

  return (
    <Link href="/app/alertas" className="block h-full">
      <Card className="hover:bg-accent/30 h-full transition-colors">
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
            <div className="flex items-center gap-3">
              <span className="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-full">
                <CircleAlert className="size-5" />
              </span>
              <p className="text-sm">
                <span className="font-medium">{total}</span>{" "}
                {total === 1 ? "pendência precisa" : "pendências precisam"} de atenção
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
