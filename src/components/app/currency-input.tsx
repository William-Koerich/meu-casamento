"use client"

import { useState } from "react"

import { Input } from "@/components/ui/input"

type CurrencyInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type"
> & {
  value?: number
  onChange: (valor: number) => void
}

function formatarCentavos(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "R$ 0,00",
  ...props
}: CurrencyInputProps) {
  const [centavos, setCentavos] = useState(() => Math.round((value ?? 0) * 100))

  function handleChange(evento: React.ChangeEvent<HTMLInputElement>) {
    const digitos = evento.target.value.replace(/\D/g, "")
    const novosCentavos = digitos ? Number(digitos) : 0
    setCentavos(novosCentavos)
    onChange(novosCentavos / 100)
  }

  return (
    <Input
      inputMode="numeric"
      value={centavos ? formatarCentavos(centavos) : ""}
      onChange={handleChange}
      placeholder={placeholder}
      {...props}
    />
  )
}
