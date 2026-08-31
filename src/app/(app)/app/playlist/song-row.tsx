"use client"

import { useTransition } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"

import { excluirMusica } from "@/actions/songs"
import type { Song } from "@/db/queries/songs"
import { cn } from "@/lib/utils"

import { SongFormDialog } from "./song-form-dialog"

export function SongRow({ musica }: { musica: Song }) {
  const [, iniciarTransicao] = useTransition()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: musica.id,
    })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border-border flex items-center gap-3 border-b px-1 py-2 text-sm last:border-b-0",
        isDragging && "relative z-10 opacity-70"
      )}
    >
      <button
        type="button"
        aria-label={`Reordenar ${musica.titulo}`}
        {...attributes}
        {...listeners}
        className="text-muted-foreground shrink-0"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate">{musica.titulo}</p>
        {musica.artista && (
          <p className="text-muted-foreground text-xs">{musica.artista}</p>
        )}
      </div>
      {musica.spotifyUrl && (
        <a
          href={musica.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground shrink-0 text-xs underline"
        >
          Spotify
        </a>
      )}
      <SongFormDialog
        musica={musica}
        trigger={
          <button
            type="button"
            className="text-muted-foreground shrink-0 text-xs underline"
          >
            Editar
          </button>
        }
      />
      <button
        type="button"
        aria-label={`Excluir ${musica.titulo}`}
        onClick={() =>
          iniciarTransicao(async () => {
            await excluirMusica(musica.id)
          })
        }
        className="text-muted-foreground hover:text-destructive shrink-0"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}
