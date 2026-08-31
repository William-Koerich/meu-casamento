"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { atualizarItemEnxoval, criarItemEnxoval } from "@/actions/trousseau"
import { CurrencyInput } from "@/components/app/currency-input"
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
import type { ItemEnxoval } from "@/db/queries/trousseau"
import { COMODO_LABELS, PRIORIDADE_LABELS } from "@/lib/labels"
import { itemEnxovalSchema, type ItemEnxovalInput } from "@/lib/validators/trousseau"

type TrousseauFormDialogProps = {
  item?: ItemEnxoval
  comodoPadrao?: ItemEnxovalInput["comodo"]
  trigger: React.ReactNode
}

export function TrousseauFormDialog({
  item,
  comodoPadrao,
  trigger,
}: TrousseauFormDialogProps) {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<ItemEnxovalInput>({
    resolver: zodResolver(itemEnxovalSchema),
    values: {
      nome: item?.nome ?? "",
      comodo: item?.comodo ?? comodoPadrao ?? "cozinha",
      quantidade: item?.quantidade ?? 1,
      prioridade: item?.prioridade ?? "media",
      precoEstimado: item?.precoEstimado ? Number(item.precoEstimado) : undefined,
    },
  })

  function onSubmit(dados: ItemEnxovalInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = item
        ? await atualizarItemEnxoval(item.id, dados)
        : await criarItemEnxoval(dados)

      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setAberto(false)
      if (!item) form.reset()
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Editar item" : "Novo item"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="comodo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cômodo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(COMODO_LABELS).map(([valor, rotulo]) => (
                          <SelectItem key={valor} value={valor}>
                            {rotulo}
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
                name="prioridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRIORIDADE_LABELS).map(([valor, rotulo]) => (
                          <SelectItem key={valor} value={valor}>
                            {rotulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={(evento) =>
                          field.onChange(evento.target.valueAsNumber || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="precoEstimado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço estimado (unidade)</FormLabel>
                    <FormControl>
                      <CurrencyInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
