import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "@/db/schema"

// Conexão administrativa: usada apenas em migrations e seed (scripts de build/dev),
// nunca para atender requisições da aplicação — ela ignora RLS.
// Para queries em Server Components e Server Actions, use `createDrizzleSupabaseClient`
// em `src/db/rls.ts`, que respeita as políticas de RLS do usuário autenticado.
const client = postgres(process.env.DATABASE_URL!, { prepare: false })

export const db = drizzle(client, { schema })
