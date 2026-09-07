"use client"

import { useEffect, useState } from "react"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import { Plus, StickyNote } from "lucide-react"

import { criarAnotacao, reordenarAnotacoes } from "@/actions/notes"
import { Button } from "@/components/ui/button"
import type { Nota } from "@/db/queries/notes"

import { NoteCard } from "./note-card"

export function NotesView({ notas: notasIniciais }: { notas: Nota[] }) {
  const [notas, setNotas] = useState(notasIniciais)
  const [notaRecemCriadaId, setNotaRecemCriadaId] = useState<string | null>(null)
  const [criando, setCriando] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  useEffect(() => {
    setNotas(notasIniciais)
  }, [notasIniciais])

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const indiceAntigo = notas.findIndex((nota) => nota.id === active.id)
    const indiceNovo = notas.findIndex((nota) => nota.id === over.id)
    if (indiceAntigo === -1 || indiceNovo === -1) return

    const reordenadas = arrayMove(notas, indiceAntigo, indiceNovo)
    setNotas(reordenadas)
    reordenarAnotacoes(reordenadas.map((nota) => nota.id))
  }

  async function adicionar() {
    setCriando(true)
    const resultado = await criarAnotacao("amarelo")
    setCriando(false)
    if (resultado.nota) {
      const { nota } = resultado
      setNotas((atual) => [...atual, nota])
      setNotaRecemCriadaId(nota.id)
    }
  }

  return (
    <div className="space-y-4">
      <Button type="button" onClick={adicionar} disabled={criando}>
        <Plus />
        {criando ? "Criando..." : "Nova anotação"}
      </Button>

      {notas.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-3 py-16 text-center text-sm">
          <span className="bg-accent flex size-12 items-center justify-center rounded-full">
            <StickyNote className="size-6" strokeWidth={1.5} />
          </span>
          Nenhuma anotação ainda — crie a primeira pra começar a organizar.
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext
            items={notas.map((nota) => nota.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {notas.map((nota) => (
                <NoteCard
                  key={nota.id}
                  nota={nota}
                  autoFocar={nota.id === notaRecemCriadaId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
