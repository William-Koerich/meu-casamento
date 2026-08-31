import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

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
            <>
              <p className="text-2xl font-medium">{percentual}%</p>
              <Progress value={percentual} className="mt-2" />
              <p className="text-muted-foreground mt-2 text-xs">
                {concluidas} de {total} tarefas concluídas
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
