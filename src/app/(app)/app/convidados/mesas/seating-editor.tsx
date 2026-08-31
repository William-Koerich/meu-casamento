"use client"

import { useState } from "react"
import { DndContext, useDroppable, type DragEndEvent } from "@dnd-kit/core"

import { atribuirConvidadoMesa, atualizarPosicaoMesa } from "@/actions/tables"
import { Button } from "@/components/ui/button"
import type { MesaComConvidados } from "@/db/queries/tables"

import { GuestChip } from "./guest-chip"
import { TableBox } from "./table-box"
import { TableFormDialog } from "./table-form-dialog"

type ConvidadoSemMesa = { id: string; nome: string; acompanhantes: number }

type SeatingEditorProps = {
  mesas: MesaComConvidados[]
  semMesa: ConvidadoSemMesa[]
}

export function SeatingEditor({ mesas, semMesa }: SeatingEditorProps) {
  const [posicoes, setPosicoes] = useState(() =>
    Object.fromEntries(
      mesas.map((mesa) => [mesa.id, { x: Number(mesa.posX), y: Number(mesa.posY) }])
    )
  )

  const { setNodeRef: setSemMesaRef, isOver: estaSobreSemMesa } = useDroppable({
    id: "sem-mesa",
  })

  function onDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event
    const activeId = String(active.id)

    if (activeId.startsWith("guest:")) {
      if (!over) return
      const guestId = activeId.slice("guest:".length)
      const overId = String(over.id)
      if (overId === "sem-mesa") {
        atribuirConvidadoMesa(guestId, null)
      } else if (overId.startsWith("table-drop:")) {
        atribuirConvidadoMesa(guestId, overId.slice("table-drop:".length))
      }
      return
    }

    if (activeId.startsWith("table-drag:")) {
      const tableId = activeId.slice("table-drag:".length)
      setPosicoes((atual) => {
        const posicaoAtual = atual[tableId] ?? { x: 0, y: 0 }
        const novaPosicao = {
          x: Math.max(0, posicaoAtual.x + delta.x),
          y: Math.max(0, posicaoAtual.y + delta.y),
        }
        atualizarPosicaoMesa(tableId, novaPosicao.x, novaPosicao.y)
        return { ...atual, [tableId]: novaPosicao }
      })
    }
  }

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="flex flex-col gap-4 lg:flex-row">
        <aside
          ref={setSemMesaRef}
          className={
            "border-border bg-card w-full shrink-0 space-y-2 rounded border p-3 lg:w-56 print:hidden" +
            (estaSobreSemMesa ? " border-primary bg-accent/40" : "")
          }
        >
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm">Sem mesa</h2>
            <TableFormDialog trigger={<Button size="sm">Nova mesa</Button>} />
          </div>
          {semMesa.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              Todos os convidados confirmados já têm mesa.
            </p>
          ) : (
            <div className="space-y-1.5">
              {semMesa.map((guest) => (
                <GuestChip
                  key={guest.id}
                  id={`guest:${guest.id}`}
                  nome={guest.nome}
                  acompanhantes={guest.acompanhantes}
                />
              ))}
            </div>
          )}
        </aside>

        <div className="border-border bg-background relative min-h-[560px] flex-1 overflow-auto rounded border">
          {mesas.length === 0 ? (
            <p className="text-muted-foreground p-8 text-center text-sm">
              Nenhuma mesa criada ainda. Use o botão &ldquo;Nova mesa&rdquo; para começar.
            </p>
          ) : (
            mesas.map((mesa) => (
              <TableBox
                key={mesa.id}
                mesa={mesa}
                posicao={posicoes[mesa.id] ?? { x: 24, y: 24 }}
              />
            ))
          )}
        </div>
      </div>
    </DndContext>
  )
}
