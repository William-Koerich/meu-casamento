import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { diasParaCasamento } from "@/lib/countdown"

export function CountdownCard({ dataCasamento }: { dataCasamento: string | null }) {
  const dias = diasParaCasamento(dataCasamento)

  return (
    <Link href="/app/configuracoes" className="block">
      <Card className="hover:bg-accent/30 transition-colors">
        <CardContent className="py-8 text-center">
          {dias === null ? (
            <p className="text-muted-foreground text-sm">
              Defina a data do casamento em Configurações para ver a contagem regressiva.
            </p>
          ) : (
            <>
              <p className="font-heading text-5xl">{Math.max(dias, 0)}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {dias > 0 && "dias para o grande dia"}
                {dias === 0 && "É hoje!"}
                {dias < 0 && "dias desde o grande dia"}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
