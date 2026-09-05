import Link from "next/link"
import { CalendarDays, MapPin } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { diasParaCasamento } from "@/lib/countdown"
import { formatDate } from "@/lib/format"

type CountdownCardProps = {
  dataCasamento: string | null
  localFesta: string | null
  cidade: string | null
  estado: string | null
}

export function CountdownCard({
  dataCasamento,
  localFesta,
  cidade,
  estado,
}: CountdownCardProps) {
  const dias = diasParaCasamento(dataCasamento)
  const localidade = [cidade, estado].filter(Boolean).join("/")
  const local = [localFesta, localidade].filter(Boolean).join(" — ")

  return (
    <Link href="/app/configuracoes" className="block">
      <Card className="bg-primary/5 ring-primary/15 hover:bg-primary/10 transition-colors">
        <CardContent className="py-8 text-center">
          {dias === null ? (
            <p className="text-muted-foreground text-sm">
              Defina a data do casamento em Configurações para ver a contagem regressiva.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-10">
              <div>
                <p className="font-heading text-5xl">{Math.max(dias, 0)}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {dias > 0 && "dias para o grande dia"}
                  {dias === 0 && "É hoje!"}
                  {dias < 0 && "dias desde o grande dia"}
                </p>
              </div>
              {(dataCasamento || local) && (
                <div className="text-muted-foreground flex flex-col gap-1.5 text-sm">
                  {dataCasamento && (
                    <span className="flex items-center justify-center gap-1.5 sm:justify-start">
                      <CalendarDays className="size-4 shrink-0" />
                      {formatDate(dataCasamento)}
                    </span>
                  )}
                  {local && (
                    <span className="flex items-center justify-center gap-1.5 sm:justify-start">
                      <MapPin className="size-4 shrink-0" />
                      {local}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
