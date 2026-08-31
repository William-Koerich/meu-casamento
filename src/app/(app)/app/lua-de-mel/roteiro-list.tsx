"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"

import { adicionarDiaRoteiro, removerDiaRoteiro } from "@/actions/honeymoon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { RoteiroDia } from "@/db/schema"

export function RoteiroList({ roteiro }: { roteiro: RoteiroDia[] }) {
  const [titulo, setTitulo] = useState("")
  const [atividades, setAtividades] = useState("")
  const [, iniciarTransicao] = useTransition()

  function adicionar() {
    if (!titulo.trim()) return
    iniciarTransicao(async () => {
      await adicionarDiaRoteiro({ dia: roteiro.length + 1, titulo, atividades })
      setTitulo("")
      setAtividades("")
    })
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="font-heading text-lg">Roteiro dia a dia</h2>
        {roteiro.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum dia adicionado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {roteiro.map((dia, indice) => (
              <li
                key={indice}
                className="border-border flex items-start justify-between gap-3 border-b pb-2 text-sm last:border-b-0"
              >
                <div>
                  <p className="font-medium">
                    Dia {dia.dia} — {dia.titulo}
                  </p>
                  {dia.atividades && (
                    <p className="text-muted-foreground">{dia.atividades}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    iniciarTransicao(async () => {
                      await removerDiaRoteiro(indice)
                    })
                  }
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="space-y-2 border-t pt-4">
          <Input
            placeholder="Título do dia"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
          />
          <Textarea
            placeholder="Atividades"
            rows={2}
            value={atividades}
            onChange={(evento) => setAtividades(evento.target.value)}
          />
          <Button type="button" variant="outline" size="sm" onClick={adicionar}>
            Adicionar dia
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
