import type { Metadata } from "next"

import { ProgressRing } from "@/components/app/progress-ring"
import { getMembrosAtribuiveis } from "@/db/queries/members"
import { getTarefas } from "@/db/queries/tasks"
import { getMinhaWedding } from "@/db/queries/weddings"

import { ChecklistView } from "./checklist-view"

export const metadata: Metadata = { title: "Checklist" }

export default async function ChecklistPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const [tarefas, membros] = await Promise.all([
    getTarefas(wedding.id),
    getMembrosAtribuiveis(wedding.id),
  ])

  const total = tarefas.length
  const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length
  const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl">Checklist</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {total === 0
              ? "Nenhuma tarefa cadastrada ainda."
              : concluidas === total
                ? "Tudo pronto por aqui! 🎉"
                : `${concluidas} de ${total} tarefas concluídas`}
          </p>
        </div>
        {total > 0 && <ProgressRing percentual={percentual} tamanho={64} espessura={7} />}
      </div>
      <ChecklistView tarefas={tarefas} membros={membros} />
    </div>
  )
}
