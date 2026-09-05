import Link from "next/link"
import { Circle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { tasks } from "@/db/schema"
import { formatDate } from "@/lib/format"

type NextTasksCardProps = {
  tarefas: (typeof tasks.$inferSelect)[]
}

export function NextTasksCard({ tarefas }: NextTasksCardProps) {
  return (
    <Link href="/app/checklist" className="block h-full">
      <Card className="hover:bg-accent/30 h-full transition-colors">
        <CardHeader>
          <CardTitle>Próximas tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          {tarefas.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma tarefa pendente. Bom trabalho!
            </p>
          ) : (
            <ul className="space-y-2">
              {tarefas.map((tarefa) => (
                <li key={tarefa.id} className="flex items-center gap-2 text-sm">
                  <Circle className="text-muted-foreground/50 size-3 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{tarefa.titulo}</span>
                  {tarefa.prazo && (
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatDate(tarefa.prazo)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
