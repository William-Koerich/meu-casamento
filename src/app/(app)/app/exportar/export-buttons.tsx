"use client"

import { Button } from "@/components/ui/button"
import type { GuestComMesa } from "@/db/queries/guests"
import type { Vendor } from "@/db/queries/vendors"
import type { TarefaComResponsavel } from "@/db/queries/tasks"
import type { CategoriaComItens, PagamentoComItem } from "@/db/queries/budget"
import { arrayParaCsv, baixarCsv } from "@/lib/csv"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  CATEGORIA_LABELS,
  GRUPO_LABELS,
  LADO_LABELS,
  STATUS_FORNECEDOR_LABELS,
  STATUS_RSVP_LABELS,
} from "@/lib/labels"

type ExportButtonsProps = {
  guests: GuestComMesa[]
  vendors: Vendor[]
  tasks: TarefaComResponsavel[]
  categorias: CategoriaComItens[]
  pagamentos: PagamentoComItem[]
}

export function ExportButtons({
  guests,
  vendors,
  tasks,
  categorias,
  pagamentos,
}: ExportButtonsProps) {
  function exportarConvidados() {
    const cabecalho = [
      "Nome",
      "E-mail",
      "Telefone",
      "Grupo",
      "Lado",
      "Acompanhantes",
      "RSVP",
      "Mesa",
    ]
    const linhas = guests.map((g) => [
      g.nome,
      g.email ?? "",
      g.telefone ?? "",
      GRUPO_LABELS[g.grupo],
      LADO_LABELS[g.lado],
      g.acompanhantes,
      STATUS_RSVP_LABELS[g.statusRsvp],
      g.table?.nome ?? "",
    ])
    baixarCsv("convidados.csv", arrayParaCsv([cabecalho, ...linhas]))
  }

  function exportarFornecedores() {
    const cabecalho = [
      "Nome",
      "Categoria",
      "Status",
      "Contato",
      "Telefone",
      "E-mail",
      "Valor proposto",
    ]
    const linhas = vendors.map((v) => [
      v.nome,
      CATEGORIA_LABELS[v.categoria],
      STATUS_FORNECEDOR_LABELS[v.status],
      v.contatoNome ?? "",
      v.telefone ?? "",
      v.email ?? "",
      v.valorProposto ? formatCurrency(v.valorProposto) : "",
    ])
    baixarCsv("fornecedores.csv", arrayParaCsv([cabecalho, ...linhas]))
  }

  function exportarChecklist() {
    const cabecalho = ["Título", "Categoria", "Prazo", "Concluída", "Responsável"]
    const linhas = tasks.map((t) => [
      t.titulo,
      CATEGORIA_LABELS[t.categoria],
      t.prazo ? formatDate(t.prazo) : "",
      t.concluida ? "Sim" : "Não",
      t.responsavel?.nome ?? "",
    ])
    baixarCsv("checklist.csv", arrayParaCsv([cabecalho, ...linhas]))
  }

  function exportarOrcamento() {
    const cabecalho = ["Categoria", "Item", "Fornecedor", "Previsto", "Contratado"]
    const linhas = categorias.flatMap((categoria) =>
      categoria.items.length > 0
        ? categoria.items.map((item) => [
            categoria.nome,
            item.descricao,
            item.vendor?.nome ?? "",
            item.valorPrevisto ?? "",
            item.valorContratado ?? "",
          ])
        : [[categoria.nome, "", "", categoria.valorPrevisto, ""]]
    )
    baixarCsv("orcamento.csv", arrayParaCsv([cabecalho, ...linhas]))
  }

  function exportarPagamentos() {
    const cabecalho = ["Descrição", "Item", "Vencimento", "Valor", "Pago"]
    const linhas = pagamentos.map((p) => [
      p.descricao,
      p.budgetItem.descricao,
      formatDate(p.vencimento),
      p.valor,
      p.pago ? "Sim" : "Não",
    ])
    baixarCsv("pagamentos.csv", arrayParaCsv([cabecalho, ...linhas]))
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button
        variant="outline"
        onClick={exportarConvidados}
        disabled={guests.length === 0}
      >
        CSV de convidados
      </Button>
      <Button
        variant="outline"
        onClick={exportarFornecedores}
        disabled={vendors.length === 0}
      >
        CSV de fornecedores
      </Button>
      <Button variant="outline" onClick={exportarChecklist} disabled={tasks.length === 0}>
        CSV do checklist
      </Button>
      <Button
        variant="outline"
        onClick={exportarOrcamento}
        disabled={categorias.length === 0}
      >
        CSV do orçamento
      </Button>
      <Button
        variant="outline"
        onClick={exportarPagamentos}
        disabled={pagamentos.length === 0}
      >
        CSV de pagamentos
      </Button>
    </div>
  )
}
