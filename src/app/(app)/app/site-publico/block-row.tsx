"use client"

import { useState, useTransition } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"

import { alternarVisibilidadeBloco, removerBloco } from "@/actions/page-blocks"
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
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { Block } from "@/db/queries/page-blocks"
import type { BlockConfigTexto } from "@/db/schema"
import { BLOCK_TIPO_LABELS } from "@/lib/labels"
import { cn } from "@/lib/utils"

import { FotoBlockDialog } from "./foto-block-dialog"
import { GaleriaBlockDialog } from "./galeria-block-dialog"
import { TextoBlockDialog } from "./texto-block-dialog"

const TIPOS_REMOVIVEIS = ["foto", "galeria", "texto"] as const

export function BlockRow({ bloco, weddingId }: { bloco: Block; weddingId: string }) {
  const [visivel, setVisivel] = useState(bloco.visivel)
  const [editarAberto, setEditarAberto] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: bloco.id })

  const removivel = (TIPOS_REMOVIVEIS as readonly string[]).includes(bloco.tipo)

  function alternar(valor: boolean) {
    setVisivel(valor)
    iniciarTransicao(async () => {
      const resultado = await alternarVisibilidadeBloco(bloco.id, valor)
      if (resultado?.erro) setVisivel(!valor)
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border-border flex items-center gap-3 border-b py-3 text-sm last:border-b-0",
        isDragging && "relative z-10 opacity-70"
      )}
    >
      <button
        type="button"
        aria-label={`Reordenar ${BLOCK_TIPO_LABELS[bloco.tipo]}`}
        {...attributes}
        {...listeners}
        className="text-muted-foreground shrink-0"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{BLOCK_TIPO_LABELS[bloco.tipo]}</p>
        {bloco.tipo === "texto" && bloco.config && (
          <p className="text-muted-foreground truncate text-xs">
            {(bloco.config as BlockConfigTexto).corpo}
          </p>
        )}
      </div>
      {(bloco.tipo === "texto" || bloco.tipo === "foto" || bloco.tipo === "galeria") && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setEditarAberto(true)}
        >
          Editar
        </Button>
      )}
      {bloco.tipo === "texto" && (
        <TextoBlockDialog
          bloco={bloco}
          open={editarAberto}
          onOpenChange={setEditarAberto}
        />
      )}
      {bloco.tipo === "foto" && (
        <FotoBlockDialog
          weddingId={weddingId}
          bloco={bloco}
          open={editarAberto}
          onOpenChange={setEditarAberto}
        />
      )}
      {bloco.tipo === "galeria" && (
        <GaleriaBlockDialog
          weddingId={weddingId}
          bloco={bloco}
          open={editarAberto}
          onOpenChange={setEditarAberto}
        />
      )}
      {removivel && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              aria-label={`Excluir ${BLOCK_TIPO_LABELS[bloco.tipo]}`}
              className="text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 className="size-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir bloco?</AlertDialogTitle>
              <AlertDialogDescription>
                Esse bloco some da página pública imediatamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={pendente}
                onClick={() =>
                  iniciarTransicao(async () => {
                    await removerBloco(bloco.id)
                  })
                }
              >
                {pendente ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Switch
        checked={visivel}
        onCheckedChange={(valor) => alternar(Boolean(valor))}
        aria-label={visivel ? "Ocultar bloco" : "Mostrar bloco"}
      />
    </div>
  )
}
