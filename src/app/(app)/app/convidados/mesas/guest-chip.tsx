"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

import { cn } from "@/lib/utils"

export function GuestChip({
  id,
  nome,
  acompanhantes,
}: {
  id: string
  nome: string
  acompanhantes: number
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  })

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "border-border bg-card w-full rounded border px-2 py-1.5 text-left text-xs",
        isDragging && "relative z-50 opacity-70"
      )}
    >
      {nome}
      {acompanhantes > 0 && (
        <span className="text-muted-foreground"> +{acompanhantes}</span>
      )}
    </button>
  )
}
