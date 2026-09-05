"use client"

import { useState, useTransition } from "react"

import { alternarPagamentoPago } from "@/actions/budget"
import { Checkbox } from "@/components/ui/checkbox"
import type { PagamentoComItem } from "@/db/queries/budget"
import { formatCurrency, formatDate, formatDistanciaAgora } from "@/lib/format"
import { cn } from "@/lib/utils"

export function PaymentAlertRow({
  pagamento,
  vencido,
}: {
  pagamento: PagamentoComItem
  vencido: boolean
}) {
  const [pago, setPago] = useState(pagamento.pago)
  const [pendente, iniciarTransicao] = useTransition()

  function alternar(valor: boolean) {
    setPago(valor)
    iniciarTransicao(async () => {
      const resultado = await alternarPagamentoPago(pagamento.id, valor)
      if (resultado?.erro) setPago(!valor)
    })
  }

  return (
    <div
      className={cn(
        "border-border flex items-start gap-3 border-b px-1 py-3 last:border-b-0",
        pendente && "pointer-events-none opacity-50"
      )}
    >
      <Checkbox
        checked={pago}
        onCheckedChange={(valor) => alternar(Boolean(valor))}
        aria-label={`Marcar "${pagamento.descricao}" como pago`}
        className="mt-1"
      />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", pago && "text-muted-foreground line-through")}>
          {pagamento.descricao}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">{pagamento.budgetItem.descricao}</span>
          <span className={cn(vencido ? "text-destructive" : "text-muted-foreground")}>
            {formatDate(pagamento.vencimento)} ·{" "}
            {formatDistanciaAgora(pagamento.vencimento)}
          </span>
        </div>
      </div>
      <span className="shrink-0 text-sm font-medium">
        {formatCurrency(pagamento.valor)}
      </span>
    </div>
  )
}
