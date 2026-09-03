"use client"

import { useState, useTransition } from "react"

import { criarCheckoutNoiva } from "@/actions/pagamentos"
import { Button } from "@/components/ui/button"

export function BotaoPagar() {
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        disabled={pendente}
        onClick={() =>
          iniciarTransicao(async () => {
            const resultado = await criarCheckoutNoiva()
            if (resultado?.erro) setErro(resultado.erro)
          })
        }
      >
        {pendente ? "Abrindo pagamento..." : "Pagar e liberar o painel"}
      </Button>
      {erro && <p className="text-destructive text-sm">{erro}</p>}
    </div>
  )
}
