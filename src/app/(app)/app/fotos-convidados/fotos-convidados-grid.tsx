"use client"

import { useTransition } from "react"
import Image from "next/image"
import { Trash2 } from "lucide-react"

import { excluirFotoConvidado } from "@/actions/guest-photos"
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
import type { GuestPhoto } from "@/db/queries/guest-photos"
import { formatDate } from "@/lib/format"

type FotoComUrl = GuestPhoto & { urlAssinada: string | null }

export function FotosConvidadosGrid({ fotos }: { fotos: FotoComUrl[] }) {
  if (fotos.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        Nenhuma foto enviada pelos convidados ainda.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {fotos.map((foto) => (
        <FotoCard key={foto.id} foto={foto} />
      ))}
    </div>
  )
}

function FotoCard({ foto }: { foto: FotoComUrl }) {
  const [pendente, iniciarTransicao] = useTransition()

  return (
    <div className="group relative">
      {foto.urlAssinada && (
        <Image
          src={foto.urlAssinada}
          alt={foto.nomeConvidado ?? "Foto enviada por convidado"}
          width={300}
          height={300}
          unoptimized
          className="aspect-square w-full rounded object-cover"
        />
      )}
      <div className="mt-1 text-xs">
        {foto.nomeConvidado && (
          <p className="truncate font-medium">{foto.nomeConvidado}</p>
        )}
        <p className="text-muted-foreground">{formatDate(foto.createdAt)}</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            aria-label="Excluir foto"
            className="bg-background/90 text-muted-foreground hover:text-destructive absolute top-1 right-1 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Trash2 className="size-3.5" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa foto não pode ser recuperada depois de excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pendente}
              onClick={() =>
                iniciarTransicao(async () => {
                  await excluirFotoConvidado(foto.id)
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
