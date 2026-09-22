import type { Metadata } from "next"

import { NOME_PRODUTO } from "@/lib/site"

export const metadata: Metadata = { title: "Você está offline" }

// Página estática pura (sem busca de dado, sem interatividade) — é o que o
// service worker (`public/sw.js`) mostra quando uma navegação falha sem
// conexão. Precisa continuar legível mesmo se os chunks JS não carregarem
// (offline de verdade), então nada aqui depende de hidratação.
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-muted-foreground text-sm tracking-widest uppercase">
        {NOME_PRODUTO}
      </p>
      <h1 className="font-heading mt-3 text-2xl">Você está offline</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        Não foi possível carregar esta página sem conexão com a internet. Verifique o
        Wi-Fi ou os dados móveis e tente novamente.
      </p>
      {/* <a> comum de propósito, não <Link> — essa página precisa funcionar
          sem os chunks JS carregados (offline de verdade); <Link> depende
          do router do Next hidratado pra navegar. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className="border-border hover:bg-accent/30 mt-6 rounded border px-4 py-2 text-sm"
      >
        Tentar novamente
      </a>
    </div>
  )
}
