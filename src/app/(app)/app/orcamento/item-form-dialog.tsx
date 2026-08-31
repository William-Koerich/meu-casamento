"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { atualizarItemOrcamento, criarItemOrcamento } from "@/actions/budget"
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
import type { CategoriaComItens } from "@/db/queries/budget"
import type { vendors } from "@/db/schema"
import { itemOrcamentoSchema, type ItemOrcamentoInput } from "@/lib/validators/budget"

const SEM_FORNECEDOR = "nenhum"

type ItemFormDialogProps = {
  categorias: CategoriaComItens[]
  vendors: (typeof vendors.$inferSelect)[]
  categoriaIdPadrao?: string
  item?: CategoriaComItens["items"][number]
  trigger: React.ReactNode
}

export function ItemFormDialog({
  categorias,
  vendors: listaFornecedores,
  categoriaIdPadrao,
  item,
  trigger,
}: ItemFormDialogProps) {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<ItemOrcamentoInput>({
    resolver: zodResolver(itemOrcamentoSchema),
    values: {
      categoryId: item?.categoryId ?? categoriaIdPadrao ?? categorias[0]?.id ?? "",
      vendorId: item?.vendorId ?? "",
      descricao: item?.descricao ?? "",
      valorPrevisto: item?.valorPrevisto ? Number(item.valorPrevisto) : undefined,
      valorContratado: item?.valorContratado ? Number(item.valorContratado) : undefined,
    },
  })

  function onSubmit(dados: ItemOrcamentoInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = item
        ? await atualizarItemOrcamento(item.id, dados)
        : await criarItemOrcamento(dados)

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
          <DialogTitle>{item ? "Editar item" : "Novo item de orçamento"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
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
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
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
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor</FormLabel>
                  <Select
                    value={field.value || SEM_FORNECEDOR}
                    onValueChange={(valor) =>
                      field.onChange(valor === SEM_FORNECEDOR ? "" : valor)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SEM_FORNECEDOR}>Sem fornecedor</SelectItem>
                      {listaFornecedores.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valorPrevisto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor previsto</FormLabel>
                    <FormControl>
                      <CurrencyInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valorContratado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor contratado</FormLabel>
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
