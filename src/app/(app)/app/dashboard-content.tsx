import { getDashboardData } from "@/db/queries/dashboard"

import { AlertsCard } from "./alerts-card"
import { BudgetCard } from "./budget-card"
import { ChecklistCard } from "./checklist-card"
import { NextTasksCard } from "./next-tasks-card"
import { RsvpCard } from "./rsvp-card"

export async function DashboardContent({ weddingId }: { weddingId: string }) {
  const dados = await getDashboardData(weddingId)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ChecklistCard
        total={dados.checklist.total}
        concluidas={dados.checklist.concluidas}
      />
      <BudgetCard {...dados.orcamento} />
      <RsvpCard {...dados.rsvp} />
      <NextTasksCard tarefas={dados.proximasTarefas} />
      <AlertsCard
        tarefasAtrasadas={dados.tarefasAtrasadas}
        pagamentosVencendo={dados.pagamentosVencendo}
      />
    </div>
  )
}
