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
    const nova = arrayMove(eventos, indiceAntigo, indiceNovo)
    setEventos(nova)
    reordenarEventos(nova.map((e) => e.id))
  }

  const ultimo = eventos.at(-1)
  const horarioSugerido = ultimo
    ? somarMinutos(ultimo.horario, ultimo.duracaoMinutos)
    : undefined

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <EventFormDialog
          horarioSugerido={horarioSugerido}
          trigger={<Button>Novo bloco</Button>}
        />
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
                {eventos.map((evento) => (
                  <EventRow key={evento.id} evento={evento} />
                ))}
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
