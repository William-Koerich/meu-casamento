"use client"

import { useState, useTransition } from "react"

import { criarSessaoPortal } from "@/actions/pagamentos"
import { Button } from "@/components/ui/button"

export function GerenciarAssinaturaButton() {
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  return (
    <div className="space-y-1">
      <Button
        variant="outline"
        disabled={pendente}
        onClick={() =>
          iniciarTransicao(async () => {
            const resultado = await criarSessaoPortal()
            if (resultado?.erro) setErro(resultado.erro)
          })
        }
      >
        {pendente ? "Abrindo..." : "Gerenciar assinatura"}
      </Button>
      {erro && <p className="text-destructive text-xs">{erro}</p>}
    </div>
  )
}
