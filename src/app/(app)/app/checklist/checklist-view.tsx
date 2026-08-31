"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MembroAtribuivel } from "@/db/queries/members"
import type { TarefaComResponsavel } from "@/db/queries/tasks"
import { CATEGORIA_LABELS } from "@/lib/labels"
import { hojeISO } from "@/lib/format"

import { agruparPorMeses } from "./agrupar"
import { TaskFormDialog } from "./task-form-dialog"
import { TaskRow } from "./task-row"

const TODAS = "todas"
const TODOS = "todos"

type ChecklistViewProps = {
  tarefas: TarefaComResponsavel[]
  membros: MembroAtribuivel[]
}

export function ChecklistView({ tarefas, membros }: ChecklistViewProps) {
  const [modo, setModo] = useState<"timeline" | "lista">("timeline")
  const [categoria, setCategoria] = useState(TODAS)
  const [status, setStatus] = useState(TODAS)
  const [responsavel, setResponsavel] = useState(TODOS)
  const [somenteAtrasadas, setSomenteAtrasadas] = useState(false)

  const hoje = hojeISO()

  const filtradas = useMemo(() => {
    return tarefas.filter((tarefa) => {
      if (categoria !== TODAS && tarefa.categoria !== categoria) return false
      if (status === "concluidas" && !tarefa.concluida) return false
      if (status === "pendentes" && tarefa.concluida) return false
      if (responsavel !== TODOS) {
        if (responsavel === "sem_responsavel" && tarefa.responsavelId) return false
        if (responsavel !== "sem_responsavel" && tarefa.responsavelId !== responsavel)
          return false
      }
      if (somenteAtrasadas) {
        const atrasada = !tarefa.concluida && !!tarefa.prazo && tarefa.prazo < hoje
        if (!atrasada) return false
      }
      return true
    })
  }, [tarefas, categoria, status, responsavel, somenteAtrasadas, hoje])

  const grupos = useMemo(() => agruparPorMeses(filtradas), [filtradas])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={modo} onValueChange={(valor) => setModo(valor as typeof modo)}>
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
          </TabsList>
        </Tabs>
        <TaskFormDialog membros={membros} trigger={<Button>Nova tarefa</Button>} />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="min-w-40 flex-1 space-y-1.5">
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS}>Todas</SelectItem>
                {Object.entries(CATEGORIA_LABELS).map(([valor, rotulo]) => (
                  <SelectItem key={valor} value={valor}>
                    {rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-40 flex-1 space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS}>Todas</SelectItem>
                <SelectItem value="pendentes">Pendentes</SelectItem>
                <SelectItem value="concluidas">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-40 flex-1 space-y-1.5">
            <Label>Responsável</Label>
            <Select value={responsavel} onValueChange={setResponsavel}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                <SelectItem value="sem_responsavel">Sem responsável</SelectItem>
                {membros.map((membro) => (
                  <SelectItem key={membro.id} value={membro.id}>
                    {membro.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Switch
              checked={somenteAtrasadas}
              onCheckedChange={setSomenteAtrasadas}
              id="atrasadas"
            />
            <Label htmlFor="atrasadas">Só atrasadas</Label>
          </div>
        </CardContent>
      </Card>

      {filtradas.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Nenhuma tarefa encontrada com esses filtros.
        </p>
      ) : modo === "timeline" ? (
        <div className="space-y-6">
          {grupos.map((grupo) => (
            <div key={grupo.mesesAntes ?? "sem-prazo"}>
              <h2 className="font-heading mb-2 text-lg">{grupo.rotulo}</h2>
              <Card>
                <CardContent>
                  {grupo.itens.map((tarefa) => (
                    <TaskRow key={tarefa.id} tarefa={tarefa} membros={membros} />
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            {filtradas.map((tarefa) => (
              <TaskRow key={tarefa.id} tarefa={tarefa} membros={membros} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
