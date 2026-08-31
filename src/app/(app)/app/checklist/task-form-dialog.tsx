"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { atualizarTarefa, criarTarefa } from "@/actions/tasks"
import { DatePickerField } from "@/components/app/date-picker-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { categoriaEnum } from "@/db/schema"
import type { TarefaComResponsavel } from "@/db/queries/tasks"
import type { MembroAtribuivel } from "@/db/queries/members"
import { CATEGORIA_LABELS } from "@/lib/labels"
import { tarefaSchema, type TarefaInput } from "@/lib/validators/tasks"

const SEM_RESPONSAVEL = "nenhum"

type TaskFormDialogProps = {
  membros: MembroAtribuivel[]
  tarefa?: TarefaComResponsavel
  trigger: React.ReactNode
}

export function TaskFormDialog({ membros, tarefa, trigger }: TaskFormDialogProps) {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<TarefaInput>({
    resolver: zodResolver(tarefaSchema),
    values: {
      titulo: tarefa?.titulo ?? "",
      descricao: tarefa?.descricao ?? "",
      categoria: tarefa?.categoria ?? "outros",
      prazo: tarefa?.prazo ?? "",
      responsavelId: tarefa?.responsavelId ?? "",
    },
  })

  function onSubmit(dados: TarefaInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = tarefa
        ? await atualizarTarefa(tarefa.id, dados)
        : await criarTarefa(dados)

      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setAberto(false)
      if (!tarefa) form.reset()
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tarefa ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(
                          Object.keys(
                            CATEGORIA_LABELS
                          ) as (typeof categoriaEnum.enumValues)[number][]
                        ).map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {CATEGORIA_LABELS[categoria]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prazo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo</FormLabel>
                    <FormControl>
                      <DatePickerField value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="responsavelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <Select
                    value={field.value || SEM_RESPONSAVEL}
                    onValueChange={(valor) =>
                      field.onChange(valor === SEM_RESPONSAVEL ? "" : valor)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SEM_RESPONSAVEL}>Sem responsável</SelectItem>
                      {membros.map((membro) => (
                        <SelectItem key={membro.id} value={membro.id}>
                          {membro.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {erro && <p className="text-destructive text-sm">{erro}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pendente}>
                {pendente ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
