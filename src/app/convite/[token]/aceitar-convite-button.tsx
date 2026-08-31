"use client"

import { useState, useTransition } from "react"

import { aceitarConvite } from "@/actions/members"
import { Button } from "@/components/ui/button"

export function AceitarConviteButton({ token }: { token: string }) {
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  return (
    <div className="space-y-2">
      <Button
        disabled={pendente}
        onClick={() =>
          iniciarTransicao(async () => {
            const resultado = await aceitarConvite(token)
            if (resultado?.erro) setErro(resultado.erro)
          })
        }
      >
        {pendente ? "Aceitando..." : "Aceitar convite"}
      </Button>
      {erro && <p className="text-destructive text-sm">{erro}</p>}
    </div>
  )
}
