import { createBrowserClient } from "@supabase/ssr"

import { supabaseEnv } from "@/lib/supabase/env"
import type { Database } from "@/lib/supabase/types"

export function createClient() {
  const { url, anonKey } = supabaseEnv()
  return createBrowserClient<Database>(url, anonKey)
}
