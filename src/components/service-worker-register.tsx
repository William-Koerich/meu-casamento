"use client"

import { useEffect } from "react"

// Só registra em produção — em dev o service worker cachearia a página
// offline com conteúdo desatualizado a cada mudança e atrapalharia o
// hot reload do `next dev`, sem nenhum ganho (instalabilidade/PWA só
// importa no app publicado de verdade).
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Sem service worker o app continua funcionando normalmente, só
      // sem instalabilidade nem tela de offline — não vale interromper
      // nada por causa disso.
    })
  }, [])

  return null
}
