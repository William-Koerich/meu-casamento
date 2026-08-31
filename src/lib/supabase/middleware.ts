import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "@/lib/supabase/types"

const PUBLIC_APP_PREFIXES = [
  "/entrar",
  "/cadastro",
  "/recuperar-senha",
  "/redefinir-senha",
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAppRoute = pathname.startsWith("/app") || pathname.startsWith("/inicio")
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
