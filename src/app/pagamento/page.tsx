import type { Metadata } from "next"

import { getMinhaWedding } from "@/db/queries/weddings"
import { formatCurrency } from "@/lib/format"
import { PRECO_NOIVA } from "@/lib/planos"

import { BotaoPagar } from "./botao-pagar"

export const metadata: Metadata = { title: "Pagamento" }

export default async function PagamentoPage() {
  const wedding = await getMinhaWedding()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl">Falta só o pagamento!</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {wedding?.nomeNoiva} & {wedding?.nomeNoivo}, o cadastro de vocês já está pronto.
          Um pagamento único de <strong>{formatCurrency(PRECO_NOIVA)}</strong> libera o
          painel completo — checklist, orçamento, convidados, mesas, site público e todo o
          resto, sem mensalidade.
        </p>
      </div>
      <BotaoPagar />
    </div>
  )
}
