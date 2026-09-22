"use client"

import { useMemo, useState, useTransition } from "react"
import { Pencil, Trash2 } from "lucide-react"

import { alternarPagamentoPago, excluirPagamento } from "@/actions/budget"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PagamentoComItem } from "@/db/queries/budget"
import { arrayParaCsv, baixarCsv } from "@/lib/csv"
import { formatCurrency, formatDate, hojeISO } from "@/lib/format"

import { PagamentoFormDialog } from "./pagamento-form-dialog"

type Filtro = "todos" | "pendente" | "pago" | "vencido"

function statusDe(pagamento: PagamentoComItem, hoje: string): Exclude<Filtro, "todos"> {
  if (pagamento.pago) return "pago"
  return pagamento.vencimento < hoje ? "vencido" : "pendente"
}

const ROTULO_STATUS: Record<Exclude<Filtro, "todos">, string> = {
  pendente: "Pendente",
  pago: "Pago",
  vencido: "Vencido",
}

function exportarCsv(pagamentos: PagamentoComItem[], hoje: string) {
  const cabecalho = [
    "Descrição",
    "Item",
    "Vencimento",
    "Valor",
    "Status",
    "Forma de pagamento",
  ]
  const linhas = pagamentos.map((pagamento) => [
    pagamento.descricao,
    pagamento.budgetItem.descricao,
    formatDate(pagamento.vencimento),
    pagamento.valor,
    ROTULO_STATUS[statusDe(pagamento, hoje)],
    pagamento.formaPagamento ?? "",
  ])
  baixarCsv("pagamentos.csv", arrayParaCsv([cabecalho, ...linhas]))
}

type ItemOpcao = { id: string; descricao: string }

export function PaymentsTab({
  pagamentos,
  itens,
}: {
  pagamentos: PagamentoComItem[]
  itens: ItemOpcao[]
}) {
  const [filtro, setFiltro] = useState<Filtro>("todos")
  const hoje = hojeISO()

  const filtrados = useMemo(
    () =>
      pagamentos.filter(
        (pagamento) => filtro === "todos" || statusDe(pagamento, hoje) === filtro
      ),
    [pagamentos, filtro, hoje]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={filtro} onValueChange={(valor) => setFiltro(valor as Filtro)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="pago">Pagos</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <PagamentoFormDialog itens={itens} />
          <Button
            variant="outline"
            disabled={pagamentos.length === 0}
            onClick={() => exportarCsv(pagamentos, hoje)}
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Nenhum pagamento encontrado com esse filtro.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Descrição</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((pagamento) => (
                <PagamentoRow
                  key={pagamento.id}
                  pagamento={pagamento}
                  hoje={hoje}
                  itens={itens}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function PagamentoRow({
  pagamento,
  hoje,
  itens,
}: {
  pagamento: PagamentoComItem
  hoje: string
  itens: ItemOpcao[]
}) {
  const [pago, setPago] = useState(pagamento.pago)
  const [, iniciarTransicao] = useTransition()
  const status = pago ? "pago" : pagamento.vencimento < hoje ? "vencido" : "pendente"

  function alternar(valor: boolean) {
    setPago(valor)
    iniciarTransicao(async () => {
      const resultado = await alternarPagamentoPago(pagamento.id, valor)
      if (resultado?.erro) setPago(!valor)
    })
  }

  return (
    <TableRow>
      <TableCell>
        <Checkbox checked={pago} onCheckedChange={(valor) => alternar(Boolean(valor))} />
      </TableCell>
      <TableCell>{pagamento.descricao}</TableCell>
      <TableCell className="text-muted-foreground">
        {pagamento.budgetItem.descricao}
      </TableCell>
      <TableCell>{formatDate(pagamento.vencimento)}</TableCell>
      <TableCell>{formatCurrency(pagamento.valor)}</TableCell>
      <TableCell>
        <Badge variant={status === "vencido" ? "destructive" : "secondary"}>
          {ROTULO_STATUS[status]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <PagamentoFormDialog
            itens={itens}
            pagamento={pagamento}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Editar pagamento ${pagamento.descricao}`}
              >
                <Pencil />
              </Button>
            }
          />
          <ExcluirPagamentoButton id={pagamento.id} descricao={pagamento.descricao} />
        </div>
      </TableCell>
    </TableRow>
  )
}

function ExcluirPagamentoButton({ id, descricao }: { id: string; descricao: string }) {
  const [pendente, iniciarTransicao] = useTransition()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Excluir pagamento ${descricao}`}
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir pagamento?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{descricao}&rdquo; será removido do orçamento.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pendente}
            onClick={() =>
              iniciarTransicao(async () => {
                await excluirPagamento(id)
              })
            }
          >
            {pendente ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
