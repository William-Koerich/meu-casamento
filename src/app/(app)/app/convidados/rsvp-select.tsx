"use client"

import { useState, useTransition } from "react"

import { atualizarRsvpInline } from "@/actions/guests"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { guests } from "@/db/schema"
import { STATUS_RSVP_LABELS } from "@/lib/labels"

type StatusRsvp = (typeof guests.$inferSelect)["statusRsvp"]

export function RsvpSelect({
  guestId,
  statusAtual,
}: {
  guestId: string
  statusAtual: StatusRsvp
}) {
  const [status, setStatus] = useState(statusAtual)
  const [, iniciarTransicao] = useTransition()

  function alterar(novoStatus: string) {
    const anterior = status
    setStatus(novoStatus as StatusRsvp)
    iniciarTransicao(async () => {
      const resultado = await atualizarRsvpInline(guestId, novoStatus as StatusRsvp)
      if (resultado?.erro) setStatus(anterior)
    })
  }

  return (
    <Select value={status} onValueChange={alterar}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_RSVP_LABELS).map(([valor, rotulo]) => (
          <SelectItem key={valor} value={valor}>
            {rotulo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
