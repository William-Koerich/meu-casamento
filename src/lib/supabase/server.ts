import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import { supabaseEnv } from "@/lib/supabase/env"
import type { Database } from "@/lib/supabase/types"

export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = supabaseEnv()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // chamado a partir de um Server Component sem permissão de escrita
          // o middleware cuida de renovar a sessão nesse caso
        }
      },
    },
  })
}
