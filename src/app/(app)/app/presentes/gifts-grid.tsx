"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { Trash2 } from "lucide-react"

import {
  alternarContribuicaoRecebida,
  alternarRecebido,
  excluirContribuicao,
  excluirPresente,
  restaurarContribuicao,
  restaurarPresente,
} from "@/actions/gifts"
import { notificarExclusao } from "@/components/app/notificar-exclusao"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import type { Gift } from "@/db/queries/gifts"
import { formatCurrency, formatDate } from "@/lib/format"

import { GiftFormDialog } from "./gift-form-dialog"

type Contribuicao = Gift["contribuicoes"][number]

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
        {gift.aceitaCotas && <ContribuicoesDoPresente gift={gift} />}
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
                  const resultado = await excluirPresente(gift.id)
                  if (resultado.linha) {
                    notificarExclusao({
                      linha: resultado.linha,
                      mensagem: `"${gift.nome}" excluído.`,
                      restaurar: restaurarPresente,
                    })
                  }
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

function ContribuicoesDoPresente({ gift }: { gift: Gift }) {
  const meta = gift.preco ? Number(gift.preco) : 0
  const total = gift.contribuicoes.reduce((soma, c) => soma + Number(c.valor), 0)
  const percentual = meta > 0 ? Math.min(100, Math.round((total / meta) * 100)) : 0

  return (
    <div className="space-y-2 border-t pt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {formatCurrency(total)} de {formatCurrency(meta)} arrecadados
        </span>
        <span className="text-muted-foreground">
          {gift.contribuicoes.length}{" "}
          {gift.contribuicoes.length === 1 ? "contribuição" : "contribuições"}
        </span>
      </div>
      <Progress value={percentual} className="h-1.5" />
      {gift.contribuicoes.length > 0 && (
        <ul className="space-y-1">
          {gift.contribuicoes.map((contribuicao) => (
            <ContribuicaoRow key={contribuicao.id} contribuicao={contribuicao} />
          ))}
        </ul>
      )}
    </div>
  )
}

function ContribuicaoRow({ contribuicao }: { contribuicao: Contribuicao }) {
  const [recebido, setRecebido] = useState(contribuicao.recebido)
  const [pendente, iniciarTransicao] = useTransition()

  function alternar(valor: boolean) {
    setRecebido(valor)
    iniciarTransicao(async () => {
      const resultado = await alternarContribuicaoRecebida(contribuicao.id, valor)
      if (resultado?.erro) setRecebido(!valor)
    })
  }

  return (
    <li className="flex items-center gap-2 text-xs">
      <Checkbox
        checked={recebido}
        onCheckedChange={(valor) => alternar(Boolean(valor))}
      />
      <span className="min-w-0 flex-1 truncate">
        {contribuicao.nome} — {formatCurrency(contribuicao.valor)}
      </span>
      <span className="text-muted-foreground shrink-0">
        {formatDate(contribuicao.createdAt)}
      </span>
      <button
        type="button"
        aria-label={`Excluir contribuição de ${contribuicao.nome}`}
        disabled={pendente}
        onClick={() =>
          iniciarTransicao(async () => {
            const resultado = await excluirContribuicao(contribuicao.id)
            if (resultado.linha) {
              notificarExclusao({
                linha: resultado.linha,
                mensagem: `Contribuição de "${contribuicao.nome}" excluída.`,
                restaurar: restaurarContribuicao,
              })
            }
          })
        }
        className="text-muted-foreground hover:text-destructive shrink-0 disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
      </button>
    </li>
  )
}
