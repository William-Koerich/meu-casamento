import Link from "next/link"

import { ProgressRing } from "@/components/app/progress-ring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ChecklistCardProps = {
  total: number
  concluidas: number
}

export function ChecklistCard({ total, concluidas }: ChecklistCardProps) {
  const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0

  return (
    <Link href="/app/checklist" className="block h-full">
      <Card className="hover:bg-accent/30 h-full transition-colors">
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma tarefa cadastrada ainda.
            </p>
          ) : (
            <div className="flex items-center gap-4">
              <ProgressRing percentual={percentual} />
              <p className="text-muted-foreground min-w-0 text-sm">
                <span className="text-foreground font-medium">{concluidas}</span> de{" "}
                {total} tarefas concluídas
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
