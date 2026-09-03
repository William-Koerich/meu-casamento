import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "@/db/schema"

// Conexão administrativa: usada em migrations e seed (scripts de build/dev),
// e nas duas únicas exceções de runtime (Fase 14 — pagamentos via Stripe):
// (1) o webhook do Stripe (src/app/api/stripe/webhook/route.ts), que não tem
// sessão de usuária/JWT pra passar por `rls()`; e (2) a escrita de
// `profiles.stripeCustomerId` em src/actions/pagamentos.ts, porque essa
// coluna teve UPDATE revogado da role "authenticated" (migration 0010) —
// é bookkeeping de sistema, não dado de negócio do casamento. Fora esses
// dois casos, nunca importar aqui para atender requisição da aplicação —
// ela ignora RLS. Para queries normais em Server Components e Server
// Actions, use `createDrizzleSupabaseClient` em `src/db/rls.ts`, que
// respeita as políticas de RLS do usuário autenticado.
const client = postgres(process.env.DATABASE_URL!, { prepare: false })

export const db = drizzle(client, { schema })
