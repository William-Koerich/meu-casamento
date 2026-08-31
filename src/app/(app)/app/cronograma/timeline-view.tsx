"use client"

import { useEffect, useState } from "react"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { reordenarEventos } from "@/actions/timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Evento } from "@/db/queries/timeline"
import { somarMinutos } from "@/lib/time"

import { EventFormDialog } from "./event-form-dialog"
import { EventRow } from "./event-row"

function recalcularLocalmente(eventos: Evento[]): Evento[] {
  if (eventos.length === 0) return eventos
  let horarioAtual = eventos[0].horario
  return eventos.map((evento, indice) => {
    if (indice === 0) {
      horarioAtual = evento.horario
      return evento
    }
    const comHorario = { ...evento, horario: horarioAtual }
    horarioAtual = somarMinutos(horarioAtual, evento.duracaoMinutos)
    return comHorario
  })
}

export function TimelineView({ eventos: eventosIniciais }: { eventos: Evento[] }) {
  const [eventos, setEventos] = useState(eventosIniciais)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  useEffect(() => {
    setEventos(eventosIniciais)
  }, [eventosIniciais])

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const indiceAntigo = eventos.findIndex((e) => e.id === active.id)
    const indiceNovo = eventos.findIndex((e) => e.id === over.id)
    const nova = recalcularLocalmente(arrayMove(eventos, indiceAntigo, indiceNovo))
    setEventos(nova)
    reordenarEventos(nova.map((e) => e.id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <EventFormDialog trigger={<Button>Novo bloco</Button>} />
      </div>
      {eventos.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Nenhum bloco cadastrado ainda.
        </p>
      ) : (
        <Card>
          <CardContent>
            <DndContext sensors={sensors} onDragEnd={onDragEnd}>
              <SortableContext
                items={eventos.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                {eventos.map((evento, indice) => (
                  <EventRow key={evento.id} evento={evento} ehPrimeiro={indice === 0} />
                ))}
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
