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

import { reordenarBlocos } from "@/actions/page-blocks"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Block } from "@/db/queries/page-blocks"
import { BLOCK_TIPO_LABELS } from "@/lib/labels"
import { getUrlBase } from "@/lib/site"

import { BlockRow } from "./block-row"
import { FotoBlockDialog } from "./foto-block-dialog"
import { GaleriaBlockDialog } from "./galeria-block-dialog"
import { TextoBlockDialog } from "./texto-block-dialog"

type TipoAdicionavel = "foto" | "galeria" | "texto"

export function SitePublicoView({
  weddingId,
  blocos: blocosIniciais,
  slug,
}: {
  weddingId: string
  blocos: Block[]
  slug: string
}) {
  const [blocos, setBlocos] = useState(blocosIniciais)
  const [novoBloco, setNovoBloco] = useState<TipoAdicionavel | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  useEffect(() => {
    setBlocos(blocosIniciais)
  }, [blocosIniciais])

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const indiceAntigo = blocos.findIndex((b) => b.id === active.id)
    const indiceNovo = blocos.findIndex((b) => b.id === over.id)
    if (indiceAntigo === -1 || indiceNovo === -1) return

    const reordenados = arrayMove(blocos, indiceAntigo, indiceNovo)
    setBlocos(reordenados)
    reordenarBlocos(reordenados.map((b) => b.id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <a
          href={`${getUrlBase()}/c/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline"
        >
          Ver página pública
        </a>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline">
              Adicionar bloco
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setNovoBloco("texto")}>
              {BLOCK_TIPO_LABELS.texto}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setNovoBloco("foto")}>
              {BLOCK_TIPO_LABELS.foto}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setNovoBloco("galeria")}>
              {BLOCK_TIPO_LABELS.galeria}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Diálogos de criação renderizados fora do DropdownMenu (controlados
          por `novoBloco`, não por um DialogTrigger aninhado no menu) — ver
          bug documentado no CLAUDE.md: nascer dentro do DropdownMenuContent
          fazia o menu desmontar o diálogo (e o estado junto) assim que o
          seletor nativo de arquivo devolvia o foco à janela. */}
      <TextoBlockDialog
        open={novoBloco === "texto"}
        onOpenChange={(aberto) => setNovoBloco(aberto ? "texto" : null)}
      />
      <FotoBlockDialog
        weddingId={weddingId}
        open={novoBloco === "foto"}
        onOpenChange={(aberto) => setNovoBloco(aberto ? "foto" : null)}
      />
      <GaleriaBlockDialog
        weddingId={weddingId}
        open={novoBloco === "galeria"}
        onOpenChange={(aberto) => setNovoBloco(aberto ? "galeria" : null)}
      />

      <Card>
        <CardContent>
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <SortableContext
              items={blocos.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocos.map((bloco) => (
                <BlockRow key={bloco.id} bloco={bloco} weddingId={weddingId} />
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  )
}
