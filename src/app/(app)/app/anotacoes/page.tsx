import type { Metadata } from "next"

import { getAnotacoes } from "@/db/queries/notes"
import { getMinhaWedding } from "@/db/queries/weddings"

import { NotesView } from "./notes-view"

export const metadata: Metadata = { title: "Anotações" }

export default async function AnotacoesPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const notas = await getAnotacoes(wedding.id)

  return (
    <div>
      <h1 className="font-heading mb-1 text-2xl">Anotações</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Post-its livres pra lembretes soltos — arraste pra organizar, escolha uma cor,
        escreva à vontade.
      </p>
      <NotesView notas={notas} />
    </div>
  )
}
