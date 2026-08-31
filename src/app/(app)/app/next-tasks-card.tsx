import Link from "next/link"

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
                <li
                  key={tarefa.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate">{tarefa.titulo}</span>
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
