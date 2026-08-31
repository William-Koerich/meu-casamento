"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"

import { adicionarItemMala, alternarItemMala, removerItemMala } from "@/actions/honeymoon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { ChecklistMalaItem } from "@/db/schema"
import { cn } from "@/lib/utils"

export function PackingChecklist({ checklist }: { checklist: ChecklistMalaItem[] }) {
  const [novoItem, setNovoItem] = useState("")
  const [, iniciarTransicao] = useTransition()

  function adicionar() {
    if (!novoItem.trim()) return
    iniciarTransicao(async () => {
      await adicionarItemMala(novoItem)
      setNovoItem("")
    })
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="font-heading text-lg">Checklist de mala</h2>
        {checklist.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum item ainda.</p>
        ) : (
          <ul className="space-y-1">
            {checklist.map((item, indice) => (
              <li
                key={indice}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={item.marcado}
                    onCheckedChange={(valor) =>
                      iniciarTransicao(async () => {
                        await alternarItemMala(indice, Boolean(valor))
                      })
                    }
                  />
                  <span
                    className={cn(item.marcado && "text-muted-foreground line-through")}
                  >
                    {item.item}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    iniciarTransicao(async () => {
                      await removerItemMala(indice)
                    })
                  }
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 border-t pt-4">
          <Input
            placeholder="Novo item"
            value={novoItem}
            onChange={(evento) => setNovoItem(evento.target.value)}
            onKeyDown={(evento) => evento.key === "Enter" && adicionar()}
          />
          <Button type="button" variant="outline" size="sm" onClick={adicionar}>
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
