import type { Metadata } from "next"

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

  return (
    <div>
      <h1 className="font-heading mb-6 text-2xl">Checklist</h1>
      <ChecklistView tarefas={tarefas} membros={membros} />
    </div>
  )
}
