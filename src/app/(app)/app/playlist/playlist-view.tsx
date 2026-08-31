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

import { reordenarMusicas } from "@/actions/songs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Song } from "@/db/queries/songs"
import { MOMENTO_LABELS } from "@/lib/labels"
import { baixarTexto } from "@/lib/text-file"

import { SongFormDialog } from "./song-form-dialog"
import { SongRow } from "./song-row"

const ORDEM_MOMENTOS = Object.keys(MOMENTO_LABELS) as (keyof typeof MOMENTO_LABELS)[]

function exportarParaDj(musicas: Song[]) {
  const linhas = ORDEM_MOMENTOS.flatMap((momento) => {
    const doMomento = musicas.filter((m) => m.momento === momento)
    if (doMomento.length === 0) return []
    return [
      `${MOMENTO_LABELS[momento].toUpperCase()}`,
      ...doMomento.map((m) => `- ${m.titulo}${m.artista ? ` — ${m.artista}` : ""}`),
      "",
    ]
  })
  baixarTexto("playlist-dj.txt", linhas.join("\n"))
}

export function PlaylistView({ musicas: musicasIniciais }: { musicas: Song[] }) {
  const [musicas, setMusicas] = useState(musicasIniciais)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  useEffect(() => {
    setMusicas(musicasIniciais)
  }, [musicasIniciais])

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const musicaArrastada = musicas.find((m) => m.id === active.id)
    if (!musicaArrastada) return

    const doMesmoMomento = musicas.filter((m) => m.momento === musicaArrastada.momento)
    const indiceAntigo = doMesmoMomento.findIndex((m) => m.id === active.id)
    const indiceNovo = doMesmoMomento.findIndex((m) => m.id === over.id)
    if (indiceNovo === -1) return

    const reordenadas = arrayMove(doMesmoMomento, indiceAntigo, indiceNovo)
    const outrasMusicas = musicas.filter((m) => m.momento !== musicaArrastada.momento)
    setMusicas([...outrasMusicas, ...reordenadas])
    reordenarMusicas(reordenadas.map((m) => m.id))
  }

  return (
    <div className="space-y-8">
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        {ORDEM_MOMENTOS.map((momento) => {
          const doMomento = musicas.filter((m) => m.momento === momento)
          return (
            <div key={momento}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-heading text-lg">{MOMENTO_LABELS[momento]}</h2>
                <SongFormDialog
                  momentoPadrao={momento}
                  trigger={
                    <button
                      type="button"
                      className="text-muted-foreground text-xs underline"
                    >
                      Adicionar
                    </button>
                  }
                />
              </div>
              {doMomento.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma música ainda.</p>
              ) : (
                <Card>
                  <CardContent>
                    <SortableContext
                      items={doMomento.map((m) => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {doMomento.map((musica) => (
                        <SongRow key={musica.id} musica={musica} />
                      ))}
                    </SortableContext>
                  </CardContent>
                </Card>
              )}
            </div>
          )
        })}
      </DndContext>
      <Button
        variant="outline"
        onClick={() => exportarParaDj(musicas)}
        disabled={musicas.length === 0}
      >
        Exportar para o DJ
      </Button>
    </div>
  )
}
