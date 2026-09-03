"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// O layout pai (`/pagamento/layout.tsx`) já redireciona pra `/app` assim que
// `wedding.pago` vira true — só precisamos forçar um re-fetch periódico até
// o webhook do Stripe confirmar (geralmente leva 1-2s, às vezes um pouco
// mais que o redirect do próprio Stripe de volta pra cá).
export function AguardandoConfirmacao() {
  const router = useRouter()

  useEffect(() => {
    const intervalo = setInterval(() => router.refresh(), 2000)
    return () => clearInterval(intervalo)
  }, [router])

  return (
    <div className="space-y-2">
      <h1 className="font-heading text-2xl">Confirmando seu pagamento...</h1>
      <p className="text-muted-foreground text-sm">
        Isso costuma levar só alguns segundos. Não feche esta página.
      </p>
    </div>
  )
}
