"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"

import {
  atualizarValorPrevistoCategoria,
  atualizarValoresItem,
  excluirItemOrcamento,
} from "@/actions/budget"
import { InlineCurrencyEditor } from "@/components/app/inline-currency-editor"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import type { CategoriaComItens } from "@/db/queries/budget"
import type { vendors as vendorsTable } from "@/db/schema"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

import { ItemFormDialog } from "./item-form-dialog"

type CategoryListProps = {
  categorias: CategoriaComItens[]
  vendors: (typeof vendorsTable.$inferSelect)[]
}

export function CategoryList({ categorias, vendors }: CategoryListProps) {
  return (
    <Accordion type="multiple" className="w-full">
      {categorias.map((categoria) => {
        const contratadoCategoria = categoria.items.reduce(
          (soma, item) => soma + Number(item.valorContratado ?? 0),
          0
        )
        const previstoCategoria = Number(categoria.valorPrevisto)
        const estourou = previstoCategoria > 0 && contratadoCategoria > previstoCategoria

        return (
          <AccordionItem key={categoria.id} value={categoria.id}>
            <AccordionTrigger>
              <div className="flex flex-1 items-center justify-between pr-4">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: categoria.cor ?? undefined }}
                  />
                  {categoria.nome}
                </span>
                <span className={cn("text-sm", estourou && "text-destructive")}>
                  {formatCurrency(contratadoCategoria)} de{" "}
                  <InlineCurrencyEditor
                    valor={previstoCategoria}
                    onSalvar={(valor) =>
                      atualizarValorPrevistoCategoria(categoria.id, valor)
                    }
                  />
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {categoria.items.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum item nesta categoria ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {categoria.items.map((item) => (
                    <div
                      key={item.id}
                      className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-3 text-sm last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{item.descricao}</p>
                        {item.vendor && (
                          <p className="text-muted-foreground text-xs">
                            {item.vendor.nome}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-4 text-xs">
                        <span className="text-muted-foreground">
                          Previsto:{" "}
                          <InlineCurrencyEditor
                            valor={item.valorPrevisto ? Number(item.valorPrevisto) : null}
                            onSalvar={(valor) =>
                              atualizarValoresItem(item.id, { valorPrevisto: valor })
                            }
                          />
                        </span>
                        <span
                          className={cn(
                            "text-muted-foreground",
                            item.valorContratado &&
                              item.valorPrevisto &&
                              Number(item.valorContratado) > Number(item.valorPrevisto) &&
                              "text-destructive"
                          )}
                        >
                          Contratado:{" "}
                          <InlineCurrencyEditor
                            valor={
                              item.valorContratado ? Number(item.valorContratado) : null
                            }
                            onSalvar={(valor) =>
                              atualizarValoresItem(item.id, { valorContratado: valor })
                            }
                          />
                        </span>
                        <ItemFormDialog
                          categorias={categorias}
                          vendors={vendors}
                          item={item}
                          trigger={
                            <button
                              type="button"
                              className="text-muted-foreground underline"
                            >
                              Editar
                            </button>
                          }
                        />
                        <DeleteItemButton id={item.id} descricao={item.descricao} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <ItemFormDialog
                categorias={categorias}
                vendors={vendors}
                categoriaIdPadrao={categoria.id}
                trigger={
                  <Button variant="outline" size="sm" className="mt-3">
                    Adicionar item
                  </Button>
                }
              />
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

function DeleteItemButton({ id, descricao }: { id: string; descricao: string }) {
  const [, iniciarTransicao] = useTransition()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button type="button" className="text-muted-foreground hover:text-destructive">
          <Trash2 className="size-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir item?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{descricao}&rdquo; será removido do orçamento, junto com os pagamentos
            ligados a ele.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              iniciarTransicao(async () => {
                await excluirItemOrcamento(id)
              })
            }
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
