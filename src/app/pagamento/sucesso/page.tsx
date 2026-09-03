import type { Metadata } from "next"

import { AguardandoConfirmacao } from "./aguardando-confirmacao"

export const metadata: Metadata = { title: "Confirmando pagamento" }

// O layout pai já redireciona pra /app assim que o webhook do Stripe marcar
// o casamento como pago — esta página só existe pra cobrir o intervalo
// entre o redirect do Stripe e o webhook chegar.
export default function PagamentoSucessoPage() {
  return <AguardandoConfirmacao />
}
