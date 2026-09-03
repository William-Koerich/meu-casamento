import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { supabaseEnv } from "@/lib/supabase/env"
import type { Database } from "@/lib/supabase/types"

// "/redefinir-senha" fica de fora de propósito: quem clica no link do e-mail
// de recuperação chega em /auth/callback já autenticado (sessão de
// recuperação) e é redirecionado para cá — se essa rota também mandasse
// usuárias autenticadas para /app, ninguém conseguiria trocar a senha.
const PUBLIC_APP_PREFIXES = ["/entrar", "/cadastro", "/recuperar-senha"]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const { url: supabaseUrl, anonKey } = supabaseEnv()
  const supabase = createServerClient<Database>(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAppRoute =
    pathname.startsWith("/app") ||
    pathname.startsWith("/inicio") ||
    pathname.startsWith("/casamentos") ||
    pathname.startsWith("/pagamento") ||
    pathname.startsWith("/planos")
  const isPublicAuthRoute = PUBLIC_APP_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (!user && isAppRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/entrar"
    url.searchParams.set("redirecionar", pathname)
    return NextResponse.redirect(url)
  }

  if (user && isPublicAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/app"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
