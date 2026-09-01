"use client"

import { useState, useTransition } from "react"
import { MoreVertical } from "lucide-react"

import { excluirConvidado } from "@/actions/guests"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { GuestComMesa } from "@/db/queries/guests"
import { getUrlBase } from "@/lib/site"

import { GuestFormDialog } from "./guest-form-dialog"

function linkConvite(codigoRsvp: string, slug: string) {
  return `${getUrlBase()}/c/${slug}/confirmar?codigo=${codigoRsvp}`
}

function mensagemWhatsapp(nome: string, link: string) {
  return `Oi, ${nome}! Você faz parte da nossa lista de convidados e ficaríamos muito felizes com sua presença. Confirme por aqui: ${link}`
}

export function GuestRowActions({ guest, slug }: { guest: GuestComMesa; slug: string }) {
  const [pendente, iniciarTransicao] = useTransition()
  const [copiado, setCopiado] = useState<"link" | "mensagem" | null>(null)

  const link = linkConvite(guest.codigoRsvp, slug)

  async function copiar(tipo: "link" | "mensagem") {
    const texto = tipo === "link" ? link : mensagemWhatsapp(guest.nome, link)
    await navigator.clipboard.writeText(texto)
    setCopiado(tipo)
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Mais ações para ${guest.nome}`}
          className="text-muted-foreground p-1"
        >
          <MoreVertical className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <GuestFormDialog
          guest={guest}
          trigger={
            <DropdownMenuItem onSelect={(evento) => evento.preventDefault()}>
              Editar
            </DropdownMenuItem>
          }
        />
        <DropdownMenuItem onSelect={() => copiar("link")}>
          {copiado === "link" ? "Link copiado!" : "Copiar link de convite"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => copiar("mensagem")}>
          {copiado === "mensagem" ? "Mensagem copiada!" : "Copiar mensagem para WhatsApp"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
              <AlertDialogTitle>Excluir convidado?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{guest.nome}&rdquo; será removido da lista de convidados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={pendente}
                onClick={() =>
                  iniciarTransicao(async () => {
                    await excluirConvidado(guest.id)
                  })
                }
              >
                {pendente ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
