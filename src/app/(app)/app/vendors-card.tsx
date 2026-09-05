import Link from "next/link"

import { ProgressRing } from "@/components/app/progress-ring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type VendorsCardProps = {
  total: number
  contratados: number
}

export function VendorsCard({ total, contratados }: VendorsCardProps) {
  const percentual = total > 0 ? Math.round((contratados / total) * 100) : 0

  return (
    <Link href="/app/fornecedores" className="block h-full">
      <Card className="hover:bg-accent/30 h-full transition-colors">
        <CardHeader>
          <CardTitle>Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum fornecedor cadastrado ainda.
            </p>
          ) : (
            <div className="flex items-center gap-4">
              <ProgressRing percentual={percentual} />
              <p className="text-muted-foreground text-sm">
                <span className="text-foreground font-medium">{contratados}</span> de{" "}
                {total} contratados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
