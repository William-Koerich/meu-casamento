"use client"

import { useTransition } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"

import { excluirEvento, restaurarEvento } from "@/actions/timeline"
import { notificarExclusao } from "@/components/app/notificar-exclusao"
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
import { somarMinutos } from "@/lib/time"
import { cn } from "@/lib/utils"

import { EventFormDialog } from "./event-form-dialog"

export function EventRow({ evento }: { evento: Evento }) {
  const [pendente, iniciarTransicao] = useTransition()
  const fim = somarMinutos(evento.horario, evento.duracaoMinutos)
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
        aria-label={`Reordenar ${evento.titulo}`}
        {...attributes}
        {...listeners}
        className="text-muted-foreground shrink-0"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="w-28 shrink-0 text-sm font-medium">
        {formatHora(evento.horario)} – {formatHora(fim)}
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
            aria-label={`Excluir ${evento.titulo}`}
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
              disabled={pendente}
              onClick={() =>
                iniciarTransicao(async () => {
                  const resultado = await excluirEvento(evento.id)
                  if (resultado.linha) {
                    notificarExclusao({
                      linha: resultado.linha,
                      mensagem: `"${evento.titulo}" excluído.`,
                      restaurar: restaurarEvento,
                    })
                  }
                })
              }
            >
              {pendente ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
