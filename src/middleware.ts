import { type NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // "sw.js" entrou na exclusão junto com as extensões de imagem — o
    // navegador reconsulta esse arquivo periodicamente pra checar
    // atualização do service worker, sem motivo pra passar pela checagem
    // de sessão do Supabase toda vez.
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
