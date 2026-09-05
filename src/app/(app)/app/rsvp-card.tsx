import Link from "next/link"

import { ProgressRing } from "@/components/app/progress-ring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type RsvpCardProps = {
  confirmado: number
  pendente: number
  recusado: number
  pessoasConfirmadas: number
}

export function RsvpCard({
  confirmado,
  pendente,
  recusado,
  pessoasConfirmadas,
}: RsvpCardProps) {
  const total = confirmado + pendente + recusado
  const percentualRespondido =
    total > 0 ? Math.round(((confirmado + recusado) / total) * 100) : 0

  return (
    <Link href="/app/convidados" className="block h-full">
      <Card className="hover:bg-accent/30 h-full transition-colors">
        <CardHeader>
          <CardTitle>RSVP</CardTitle>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum convidado cadastrado ainda.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <ProgressRing percentual={percentualRespondido} />
                <p className="text-muted-foreground text-sm">
                  <span className="text-foreground font-medium">
                    {pessoasConfirmadas}
                  </span>{" "}
                  {pessoasConfirmadas === 1 ? "pessoa confirmada" : "pessoas confirmadas"}{" "}
                  (com acompanhantes)
                </p>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <dt className="text-muted-foreground text-xs">Confirmados</dt>
                  <dd className="text-sm font-medium">{confirmado}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Pendentes</dt>
                  <dd className="text-sm font-medium">{pendente}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Recusados</dt>
                  <dd className="text-sm font-medium">{recusado}</dd>
                </div>
              </dl>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
