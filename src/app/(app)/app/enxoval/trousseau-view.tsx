"use client"

import { useMemo, useTransition } from "react"

import { alternarComprado, excluirItemEnxoval } from "@/actions/trousseau"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { ItemEnxoval } from "@/db/queries/trousseau"
import { formatCurrency } from "@/lib/format"
import { COMODO_LABELS, PRIORIDADE_LABELS } from "@/lib/labels"
import { cn } from "@/lib/utils"

import { TrousseauFormDialog } from "./trousseau-form-dialog"

const ORDEM_COMODOS = Object.keys(COMODO_LABELS) as (keyof typeof COMODO_LABELS)[]

function valorItem(item: ItemEnxoval) {
  return Number(item.precoEstimado ?? 0) * item.quantidade
}

export function TrousseauView({ itens }: { itens: ItemEnxoval[] }) {
  const totais = useMemo(() => {
    const geral = itens.reduce((soma, item) => soma + valorItem(item), 0)
    const faltando = itens
      .filter((item) => !item.comprado)
      .reduce((soma, item) => soma + valorItem(item), 0)
    return { geral, faltando }
  }, [itens])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-xs">Total geral</p>
            <p className="mt-1 text-xl font-medium">{formatCurrency(totais.geral)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-xs">Falta comprar</p>
            <p className="mt-1 text-xl font-medium">{formatCurrency(totais.faltando)}</p>
          </CardContent>
        </Card>
      </div>

      {itens.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Nenhum item cadastrado ainda.
        </p>
      ) : (
        ORDEM_COMODOS.map((comodo) => {
          const doComodo = itens.filter((item) => item.comodo === comodo)
          if (doComodo.length === 0) return null

          return (
            <div key={comodo}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-heading text-lg">{COMODO_LABELS[comodo]}</h2>
                <TrousseauFormDialog
                  comodoPadrao={comodo}
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
              <Card>
                <CardContent>
                  {doComodo.map((item) => (
                    <TrousseauRow key={item.id} item={item} />
                  ))}
                </CardContent>
              </Card>
            </div>
          )
        })
      )}
    </div>
  )
}

function TrousseauRow({ item }: { item: ItemEnxoval }) {
  const [, iniciarTransicao] = useTransition()

  return (
    <div className="border-border flex items-center gap-3 border-b py-2 text-sm last:border-b-0">
      <Checkbox
        checked={item.comprado}
        onCheckedChange={(valor) =>
          iniciarTransicao(async () => {
            await alternarComprado(item.id, Boolean(valor))
          })
        }
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate",
            item.comprado && "text-muted-foreground line-through"
          )}
        >
          {item.nome} {item.quantidade > 1 ? `(${item.quantidade})` : ""}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{PRIORIDADE_LABELS[item.prioridade]}</Badge>
          {item.precoEstimado && (
            <span className="text-muted-foreground text-xs">
              {formatCurrency(valorItem(item))}
            </span>
          )}
        </div>
      </div>
      <TrousseauFormDialog
        item={item}
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
        onClick={() =>
          iniciarTransicao(async () => {
            await excluirItemEnxoval(item.id)
          })
        }
        className="text-destructive shrink-0 text-xs underline"
      >
        Excluir
      </button>
    </div>
  )
}
