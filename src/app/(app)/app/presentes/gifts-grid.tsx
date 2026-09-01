"use client"

import { useState, useTransition } from "react"
import Image from "next/image"

import { alternarRecebido, excluirPresente } from "@/actions/gifts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { Gift } from "@/db/queries/gifts"
import { formatCurrency } from "@/lib/format"

import { GiftFormDialog } from "./gift-form-dialog"

export function GiftsGrid({ gifts, weddingId }: { gifts: Gift[]; weddingId: string }) {
  if (gifts.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        Nenhum presente cadastrado ainda.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {gifts.map((gift) => (
        <GiftCard key={gift.id} gift={gift} weddingId={weddingId} />
      ))}
    </div>
  )
}

function GiftCard({ gift, weddingId }: { gift: Gift; weddingId: string }) {
  const [recebido, setRecebido] = useState(gift.recebido)
  const [pendente, iniciarTransicao] = useTransition()

  function alternarCheckbox(valor: boolean) {
    setRecebido(valor)
    iniciarTransicao(async () => {
      const resultado = await alternarRecebido(gift.id, valor)
      if (resultado?.erro) setRecebido(!valor)
    })
  }

  return (
    <Card>
      {gift.imagemUrl && (
        <Image
          src={gift.imagemUrl}
          alt={gift.nome}
          width={400}
          height={240}
          className="h-40 w-full rounded-t object-cover"
          unoptimized
        />
      )}
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{gift.nome}</p>
          {recebido && <Badge variant="secondary">Recebido</Badge>}
        </div>
        {gift.preco && (
          <p className="text-muted-foreground text-sm">{formatCurrency(gift.preco)}</p>
        )}
        {gift.reservadoPorNome && (
          <p className="text-muted-foreground text-xs">
            Reservado por {gift.reservadoPorNome}
            {gift.reservadoPorEmail ? ` (${gift.reservadoPorEmail})` : ""}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs">
            <Checkbox
              checked={recebido}
              onCheckedChange={(valor) => alternarCheckbox(Boolean(valor))}
            />
            Recebido
          </label>
          <div className="flex gap-3 text-xs">
            <GiftFormDialog
              weddingId={weddingId}
              gift={gift}
              trigger={
                <button type="button" className="underline">
                  Editar
                </button>
              }
            />
            <button
              type="button"
              disabled={pendente}
              onClick={() =>
                iniciarTransicao(async () => {
                  await excluirPresente(gift.id)
                })
              }
              className="text-destructive underline disabled:opacity-50"
            >
              {pendente ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
