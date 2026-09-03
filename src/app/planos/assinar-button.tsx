"use client"

import { useState, useTransition } from "react"

import { criarCheckoutCerimonialista } from "@/actions/pagamentos"
import { Button } from "@/components/ui/button"
import type { PlanoCerimonialista } from "@/lib/planos"

export function AssinarButton({
  plano,
  destaque,
}: {
  plano: PlanoCerimonialista
  destaque?: boolean
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  return (
    <div className="space-y-1">
      <Button
        className="w-full"
        variant={destaque ? "default" : "outline"}
        disabled={pendente}
        onClick={() =>
          iniciarTransicao(async () => {
            const resultado = await criarCheckoutCerimonialista(plano)
            if (resultado?.erro) setErro(resultado.erro)
          })
        }
      >
        {pendente ? "Abrindo checkout..." : "Assinar"}
      </Button>
      {erro && <p className="text-destructive text-xs">{erro}</p>}
    </div>
  )
}
