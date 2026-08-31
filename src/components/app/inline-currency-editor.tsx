"use client"

import { useState, useTransition } from "react"
import { Check, Pencil } from "lucide-react"

import { CurrencyInput } from "@/components/app/currency-input"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

type InlineCurrencyEditorProps = {
  valor: number | null
  onSalvar: (novoValor: number) => Promise<{ erro?: string } | void>
  className?: string
}

export function InlineCurrencyEditor({
  valor,
  onSalvar,
  className,
}: InlineCurrencyEditorProps) {
  const [editando, setEditando] = useState(false)
  const [valorLocal, setValorLocal] = useState(valor ?? 0)
  const [pendente, iniciarTransicao] = useTransition()

  if (!editando) {
    return (
      <button
        type="button"
        onClick={() => {
          setValorLocal(valor ?? 0)
          setEditando(true)
        }}
        className={cn("group inline-flex items-center gap-1.5", className)}
      >
        {formatCurrency(valor ?? 0)}
        <Pencil className="text-muted-foreground size-3 opacity-0 group-hover:opacity-100" />
      </button>
    )
  }

  function salvar() {
    iniciarTransicao(async () => {
      await onSalvar(valorLocal)
      setEditando(false)
    })
  }

  return (
    <div className="inline-flex items-center gap-1">
      <CurrencyInput value={valorLocal} onChange={setValorLocal} />
      <Button
        type="button"
        size="icon"
        className="size-8"
        disabled={pendente}
        onClick={salvar}
      >
        <Check className="size-4" />
      </Button>
    </div>
  )
}
