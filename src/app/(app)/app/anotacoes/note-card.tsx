"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"

import {
  atualizarConteudoAnotacao,
  atualizarCorAnotacao,
  excluirAnotacao,
} from "@/actions/notes"
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
import type { Nota } from "@/db/queries/notes"
import { NOTA_COR_LABELS } from "@/lib/labels"
import { cn } from "@/lib/utils"

type CorNota = Nota["cor"]

// Paleta fixa de post-it — tons pastel no claro, versões escurecidas e
// dessaturadas no escuro (mesmo espírito das outras cores de tema em
// globals.css: nunca a mesma cor crua nos dois modos). Não é a cor de
// destaque do produto (ver decisão de Paleta no CLAUDE.md) — é conteúdo da
// própria nota, escolhido pela usuária, não uma cor de marca.
const CLASSES_POR_COR: Record<CorNota, string> = {
  amarelo: "bg-[#fdf1b8] dark:bg-[#4a4020]",
  rosa: "bg-[#f8dbe4] dark:bg-[#4a2c36]",
  azul: "bg-[#d6e8f7] dark:bg-[#20384a]",
  verde: "bg-[#dcecd4] dark:bg-[#28402a]",
  lilas: "bg-[#e7ddf5] dark:bg-[#352a4a]",
}

const CORES = Object.keys(CLASSES_POR_COR) as CorNota[]

export function NoteCard({ nota, autoFocar }: { nota: Nota; autoFocar?: boolean }) {
  const [conteudo, setConteudo] = useState(nota.conteudo)
  const [cor, setCor] = useState(nota.cor)
  const [excluindo, setExcluindo] = useState(false)
  const [seletorCorAberto, setSeletorCorAberto] = useState(false)
  const [, iniciarTransicao] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: nota.id })

  useEffect(() => {
    if (autoFocar) textareaRef.current?.focus()
  }, [autoFocar])

  // Autosave com debounce enquanto digita + salva de novo ao sair do campo
  // (garante que a última pausa curta antes de trocar de nota não se perca).
  function alterarConteudo(valor: string) {
    setConteudo(valor)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      iniciarTransicao(async () => {
        await atualizarConteudoAnotacao(nota.id, valor)
      })
    }, 800)
  }

  function salvarAoSair() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    iniciarTransicao(async () => {
      await atualizarConteudoAnotacao(nota.id, conteudo)
    })
  }

  function trocarCor(novaCor: CorNota) {
    setCor(novaCor)
    setSeletorCorAberto(false)
    iniciarTransicao(async () => {
      await atualizarCorAnotacao(nota.id, novaCor)
    })
  }

  function excluir() {
    setExcluindo(true)
    iniciarTransicao(async () => {
      await excluirAnotacao(nota.id)
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex aspect-square flex-col gap-2 rounded-lg p-3 shadow-sm transition-opacity",
        CLASSES_POR_COR[cor],
        isDragging && "relative z-10 opacity-70",
        excluindo && "pointer-events-none opacity-40"
      )}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Reordenar anotação"
          {...attributes}
          {...listeners}
          className="text-foreground/40 hover:text-foreground/70 cursor-grab touch-none"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              aria-label="Trocar cor"
              onClick={() => setSeletorCorAberto((valor) => !valor)}
              className={cn(
                "border-foreground/20 size-4 rounded-full border",
                CLASSES_POR_COR[cor]
              )}
            />
            {seletorCorAberto && (
              <div className="bg-card border-border absolute top-6 right-0 z-20 flex gap-1 rounded-full border p-1.5 shadow-sm">
                {CORES.map((valorCor) => (
                  <button
                    key={valorCor}
                    type="button"
                    aria-label={NOTA_COR_LABELS[valorCor]}
                    onClick={() => trocarCor(valorCor)}
                    className={cn(
                      "border-foreground/20 size-4 rounded-full border",
                      CLASSES_POR_COR[valorCor],
                      valorCor === cor && "ring-foreground/50 ring-2 ring-offset-1"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                aria-label="Excluir anotação"
                className="text-foreground/40 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir anotação?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={excluir}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={conteudo}
        onChange={(evento) => alterarConteudo(evento.target.value)}
        onBlur={salvarAoSair}
        placeholder="Escreva aqui..."
        className="text-foreground/90 placeholder:text-foreground/40 flex-1 resize-none overflow-y-auto bg-transparent text-sm outline-none"
      />
    </div>
  )
}
