"use client"

import { useTransition } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2, X } from "lucide-react"

import { atribuirConvidadoMesa, excluirMesa } from "@/actions/tables"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { MesaComConvidados } from "@/db/queries/tables"
import { cn } from "@/lib/utils"

import { TableFormDialog } from "./table-form-dialog"

export function TableBox({
  mesa,
  posicao,
}: {
  mesa: MesaComConvidados
  posicao: { x: number; y: number }
}) {
  const [pendente, iniciarTransicao] = useTransition()
  const ocupacao = mesa.guests.length
  const estourou = ocupacao > mesa.capacidade

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `table-drop:${mesa.id}` })
  const {
    setNodeRef: setDragRef,
    listeners,
    attributes,
    transform,
  } = useDraggable({ id: `table-drag:${mesa.id}` })

  const largura =
    mesa.formato === "imperial" ? 220 : Math.max(140, 100 + mesa.capacidade * 6)

  return (
    <div
      ref={setDropRef}
      style={{ left: posicao.x, top: posicao.y, width: largura }}
      className={cn(
        "border-border bg-card absolute rounded border p-2 shadow-none",
        mesa.formato === "redonda" && "rounded-full text-center",
        isOver && "border-primary bg-accent/40",
        estourou && "border-destructive"
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <button
          ref={setDragRef}
          {...listeners}
          {...attributes}
          type="button"
          style={{ transform: CSS.Translate.toString(transform) }}
          className="flex min-w-0 flex-1 touch-none items-center gap-1 text-left"
        >
          <GripVertical className="text-muted-foreground size-3 shrink-0" />
          <span className="truncate text-sm font-medium">{mesa.nome}</span>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <TableFormDialog
            mesa={mesa}
            trigger={
              <button type="button" className="text-muted-foreground text-xs underline">
                Editar
              </button>
            }
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                aria-label={`Excluir ${mesa.nome}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir mesa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Os convidados atribuídos a &ldquo;{mesa.nome}&rdquo; voltam para a lista
                  sem mesa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  disabled={pendente}
                  onClick={() =>
                    iniciarTransicao(async () => {
                      await excluirMesa(mesa.id)
                    })
                  }
                >
                  {pendente ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <p
        className={cn(
          "mt-0.5 text-xs",
          estourou ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {ocupacao}/{mesa.capacidade} lugares
      </p>
      {mesa.guests.length > 0 && (
        <ul className="mt-2 space-y-1">
          {mesa.guests.map((guest) => (
            <li
              key={guest.id}
              className="flex items-center justify-between gap-1 text-xs"
            >
              <span className="min-w-0 flex-1 truncate">{guest.nome}</span>
              <button
                type="button"
                aria-label={`Tirar ${guest.nome} da mesa`}
                disabled={pendente}
                onClick={() =>
                  iniciarTransicao(async () => {
                    await atribuirConvidadoMesa(guest.id, null)
                  })
                }
                className="text-muted-foreground hover:text-destructive shrink-0 disabled:opacity-50"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
