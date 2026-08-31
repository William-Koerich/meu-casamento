"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { NOME_PRODUTO } from "@/lib/site"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-muted-foreground text-sm tracking-widest uppercase">
        {NOME_PRODUTO}
      </p>
      <h1 className="font-heading mt-3 text-4xl">Algo deu errado</h1>
      <p className="text-muted-foreground mt-3 max-w-sm">
        Não foi possível carregar esta página. Tente novamente em instantes.
      </p>
      <Button className="mt-6" onClick={reset}>
        Tentar de novo
      </Button>
    </div>
  )
}
