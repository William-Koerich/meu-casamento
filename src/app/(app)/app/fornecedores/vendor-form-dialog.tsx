"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  atualizarFornecedor,
  criarFornecedor,
  criarItemOrcamentoDoFornecedor,
} from "@/actions/vendors"
import { CurrencyInput } from "@/components/app/currency-input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { CategoriaComItens } from "@/db/queries/budget"
import type { Vendor } from "@/db/queries/vendors"
import { CATEGORIA_LABELS, STATUS_FORNECEDOR_LABELS } from "@/lib/labels"
import { fornecedorSchema, type FornecedorInput } from "@/lib/validators/vendors"

type VendorFormDialogProps = {
  categoriasOrcamento: Pick<CategoriaComItens, "id" | "nome">[]
  vendor?: Vendor
  trigger: React.ReactNode
}

export function VendorFormDialog({
  categoriasOrcamento,
  vendor,
  trigger,
}: VendorFormDialogProps) {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [criarItem, setCriarItem] = useState(false)
  const [categoriaOrcamentoId, setCategoriaOrcamentoId] = useState(
    categoriasOrcamento[0]?.id ?? ""
  )
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<FornecedorInput>({
    resolver: zodResolver(fornecedorSchema),
    values: {
      nome: vendor?.nome ?? "",
      categoria: vendor?.categoria ?? "outros",
      contatoNome: vendor?.contatoNome ?? "",
      telefone: vendor?.telefone ?? "",
      email: vendor?.email ?? "",
      instagram: vendor?.instagram ?? "",
      site: vendor?.site ?? "",
      valorProposto: vendor?.valorProposto ? Number(vendor.valorProposto) : undefined,
      status: vendor?.status ?? "pesquisando",
      avaliacao: vendor?.avaliacao ?? undefined,
      observacoes: vendor?.observacoes ?? "",
    },
  })

  const statusAtual = form.watch("status")
  const valorProposto = form.watch("valorProposto")

  function onSubmit(dados: FornecedorInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = vendor
        ? await atualizarFornecedor(vendor.id, dados)
        : await criarFornecedor(dados)

      if (resultado.erro) {
        setErro(resultado.erro)
        return
      }

      if (
        criarItem &&
        dados.status === "contratado" &&
        "id" in resultado &&
        resultado.id &&
        categoriaOrcamentoId
      ) {
        await criarItemOrcamentoDoFornecedor(
          resultado.id,
          categoriaOrcamentoId,
          dados.valorProposto ?? 0
        )
      }

      setAberto(false)
      if (!vendor) form.reset()
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor ? "Editar fornecedor" : "Novo fornecedor"}</DialogTitle>
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
                        {Object.entries(CATEGORIA_LABELS).map(([valor, rotulo]) => (
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(STATUS_FORNECEDOR_LABELS).map(
                          ([valor, rotulo]) => (
                            <SelectItem key={valor} value={valor}>
                              {rotulo}
                            </SelectItem>
                          )
                        )}
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
                name="contatoNome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="@usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valorProposto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor proposto</FormLabel>
                    <FormControl>
                      <CurrencyInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="avaliacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avaliação (1 a 5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={field.value ?? ""}
                      onChange={(evento) =>
                        field.onChange(evento.target.valueAsNumber || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {statusAtual === "contratado" && categoriasOrcamento.length > 0 && (
              <div className="bg-accent/40 space-y-3 rounded p-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="criar-item"
                    checked={criarItem}
                    onCheckedChange={(valor) => setCriarItem(Boolean(valor))}
                  />
                  <FormLabel htmlFor="criar-item" className="font-normal">
                    Criar item de orçamento para este fornecedor
                    {valorProposto ? ` (${valorProposto.toLocaleString("pt-BR")})` : ""}
                  </FormLabel>
                </div>
                {criarItem && (
                  <Select
                    value={categoriaOrcamentoId}
                    onValueChange={setCategoriaOrcamentoId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Categoria do orçamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasOrcamento.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

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
