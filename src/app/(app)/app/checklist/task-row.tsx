"use client"

import { useState, useTransition } from "react"
import { MoreVertical } from "lucide-react"

import { alternarConclusao, excluirTarefa } from "@/actions/tasks"
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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TarefaComResponsavel } from "@/db/queries/tasks"
import type { MembroAtribuivel } from "@/db/queries/members"
import { formatDate, hojeISO } from "@/lib/format"
import { CATEGORIA_LABELS } from "@/lib/labels"
import { cn } from "@/lib/utils"

import { TaskFormDialog } from "./task-form-dialog"

export function TaskRow({
  tarefa,
  membros,
}: {
  tarefa: TarefaComResponsavel
  membros: MembroAtribuivel[]
}) {
  const [concluida, setConcluida] = useState(tarefa.concluida)
  const [excluindo, setExcluindo] = useState(false)
  const [, iniciarTransicao] = useTransition()

  const atrasada = !concluida && !!tarefa.prazo && tarefa.prazo < hojeISO()

  function alternar(valor: boolean) {
    setConcluida(valor)
    iniciarTransicao(async () => {
      const resultado = await alternarConclusao(tarefa.id, valor)
      if (resultado?.erro) setConcluida(!valor)
    })
  }

  function excluir() {
    setExcluindo(true)
    iniciarTransicao(async () => {
      await excluirTarefa(tarefa.id)
    })
  }

  return (
    <div
      className={cn(
        "border-border flex items-start gap-3 border-b px-1 py-3 last:border-b-0",
        excluindo && "pointer-events-none opacity-50"
      )}
    >
      <Checkbox
        checked={concluida}
        onCheckedChange={(valor) => alternar(Boolean(valor))}
        className="mt-1"
      />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", concluida && "text-muted-foreground line-through")}>
          {tarefa.titulo}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{CATEGORIA_LABELS[tarefa.categoria]}</Badge>
          {tarefa.prazo && (
            <span
              className={cn(
                "text-xs",
                atrasada ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {atrasada ? "Atrasada — " : ""}
              {formatDate(tarefa.prazo)}
            </span>
          )}
          {tarefa.responsavel && (
            <span className="text-muted-foreground text-xs">
              {tarefa.responsavel.nome}
            </span>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Mais ações para ${tarefa.titulo}`}
            className="text-muted-foreground p-1"
          >
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <TaskFormDialog
            membros={membros}
            tarefa={tarefa}
            trigger={
              <DropdownMenuItem onSelect={(evento) => evento.preventDefault()}>
                Editar
              </DropdownMenuItem>
            }
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(evento) => evento.preventDefault()}
              >
                Excluir
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{tarefa.titulo}&rdquo; será removida do checklist. Essa ação não
                  pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={excluir}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
