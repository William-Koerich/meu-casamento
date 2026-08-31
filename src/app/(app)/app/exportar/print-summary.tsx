import { Card, CardContent } from "@/components/ui/card"
import type { GuestComMesa } from "@/db/queries/guests"
import type { Vendor } from "@/db/queries/vendors"
import type { TarefaComResponsavel } from "@/db/queries/tasks"
import type { weddings } from "@/db/schema"
import { formatCurrency, formatDate } from "@/lib/format"
import { CATEGORIA_LABELS, STATUS_FORNECEDOR_LABELS } from "@/lib/labels"

type PrintSummaryProps = {
  wedding: typeof weddings.$inferSelect
  guests: GuestComMesa[]
  vendors: Vendor[]
  tasks: TarefaComResponsavel[]
  orcamento: { previsto: number; contratado: number; pago: number }
}

export function PrintSummary({
  wedding,
  guests,
  vendors,
  tasks,
  orcamento,
}: PrintSummaryProps) {
  const concluidas = tasks.filter((t) => t.concluida).length
  const confirmados = guests.filter((g) => g.statusRsvp === "confirmado").length

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <h2 className="font-heading text-xl">
            {wedding.nomeNoiva} & {wedding.nomeNoivo}
          </h2>
          {wedding.dataCasamento && (
            <p className="text-muted-foreground text-sm">
              {formatDate(wedding.dataCasamento)}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-xs">Checklist</p>
            <p>
              {concluidas} de {tasks.length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Convidados confirmados</p>
            <p>
              {confirmados} de {guests.length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Orçamento previsto</p>
            <p>{formatCurrency(orcamento.previsto)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Pago até agora</p>
            <p>{formatCurrency(orcamento.pago)}</p>
          </div>
        </div>
        <div>
          <h3 className="font-heading mb-2 text-lg">Fornecedores contratados</h3>
          {vendors.filter((v) => v.status === "contratado").length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum fornecedor contratado ainda.
            </p>
          ) : (
            <ul className="text-sm">
              {vendors
                .filter((v) => v.status === "contratado")
                .map((v) => (
                  <li key={v.id}>
                    {v.nome} — {CATEGORIA_LABELS[v.categoria]} (
                    {STATUS_FORNECEDOR_LABELS[v.status]})
                  </li>
                ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
