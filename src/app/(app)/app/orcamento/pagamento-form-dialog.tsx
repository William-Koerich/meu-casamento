"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { atualizarPagamento, criarPagamento } from "@/actions/budget"
import { CurrencyInput } from "@/components/app/currency-input"
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
import type { PagamentoComItem } from "@/db/queries/budget"
import { pagamentoSchema, type PagamentoInput } from "@/lib/validators/budget"

type ItemOpcao = { id: string; descricao: string }

type PagamentoFormDialogProps = {
  itens: ItemOpcao[]
  pagamento?: PagamentoComItem
  trigger?: React.ReactNode
}

export function PagamentoFormDialog({
  itens,
  pagamento,
  trigger,
}: PagamentoFormDialogProps) {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<PagamentoInput>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: {
      budgetItemId: pagamento?.budgetItemId ?? itens[0]?.id ?? "",
      descricao: pagamento?.descricao ?? "",
      valor: pagamento ? Number(pagamento.valor) : undefined,
      vencimento: pagamento?.vencimento ?? "",
      formaPagamento: pagamento?.formaPagamento ?? "",
    },
  })

  function onSubmit(dados: PagamentoInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = pagamento
        ? await atualizarPagamento(pagamento.id, dados)
        : await criarPagamento(dados)
      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setAberto(false)
      if (!pagamento) form.reset()
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Novo pagamento</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{pagamento ? "Editar pagamento" : "Novo pagamento"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="budgetItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item de orçamento</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {itens.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.descricao}
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
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Sinal, 2ª parcela..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <CurrencyInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento</FormLabel>
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
              name="formaPagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Pix, cartão, boleto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {erro && <p className="text-destructive text-sm">{erro}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pendente || itens.length === 0}>
                {pendente ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
