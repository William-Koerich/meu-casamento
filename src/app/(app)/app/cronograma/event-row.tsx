"use client"

import { useTransition } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"

import { excluirEvento } from "@/actions/timeline"
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
import type { Evento } from "@/db/queries/timeline"
import { formatHora } from "@/lib/format"
import { cn } from "@/lib/utils"

import { EventFormDialog } from "./event-form-dialog"

export function EventRow({
  evento,
  ehPrimeiro,
}: {
  evento: Evento
  ehPrimeiro: boolean
}) {
  const [, iniciarTransicao] = useTransition()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: evento.id,
    })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border-border bg-card flex items-center gap-3 border-b px-2 py-3 last:border-b-0",
        isDragging && "relative z-10 opacity-70"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-muted-foreground shrink-0"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="w-14 shrink-0 text-sm font-medium">
        {formatHora(evento.horario)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{evento.titulo}</p>
        <p className="text-muted-foreground text-xs">
          {evento.duracaoMinutos} min
          {evento.responsavel ? ` · ${evento.responsavel}` : ""}
          {evento.local ? ` · ${evento.local}` : ""}
        </p>
      </div>
      <EventFormDialog
        evento={evento}
        ehPrimeiro={ehPrimeiro}
        trigger={
          <button
            type="button"
            className="text-muted-foreground shrink-0 text-xs underline"
          >
            Editar
          </button>
        }
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            <Trash2 className="size-4" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir bloco?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{evento.titulo}&rdquo; será removido do cronograma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                iniciarTransicao(async () => {
                  await excluirEvento(evento.id)
                })
              }
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
