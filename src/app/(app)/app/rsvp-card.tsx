import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type RsvpCardProps = {
  confirmado: number
  pendente: number
  recusado: number
}

export function RsvpCard({ confirmado, pendente, recusado }: RsvpCardProps) {
  const total = confirmado + pendente + recusado

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
            <dl className="grid grid-cols-3 gap-2 text-center">
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
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
