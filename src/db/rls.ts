import "server-only"

import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "@/db/schema"
import { createClient } from "@/lib/supabase/server"

// Cliente Drizzle para uso em Server Components e Server Actions.
// Cada chamada roda dentro de uma transação Postgres que assume o papel
// (`anon`/`authenticated`) e as claims do usuário logado no Supabase Auth,
// então as políticas de RLS do banco são aplicadas exatamente como seriam
// via PostgREST. Isso evita usar a service key no código da aplicação.
const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client, { schema })

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

// Contexto extra para os dois fluxos públicos por "token de posse" (sem
// login): RSVP por código do convidado (`guests`) e visualização/aceite de
// convite de equipe por token (`wedding_members`). As policies desses dois
// casos comparam a coluna com `current_setting('request.guest_code', ...)` /
// `current_setting('request.invite_token', ...)` — ver src/db/schema/guests.ts
// e src/db/schema/wedding-members.ts.
type RlsContext = {
  guestCode?: string
  inviteToken?: string
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1]
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
  const json = Buffer.from(base64, "base64").toString("utf-8")
  return JSON.parse(json)
}

export async function createDrizzleSupabaseClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const claims = session ? decodeJwtPayload(session.access_token) : {}
  const role = user ? "authenticated" : "anon"

  async function rls<T>(
    callback: (tx: Transaction) => Promise<T>,
    contexto: RlsContext = {}
  ): Promise<T> {
    return db.transaction(async (tx) => {
      try {
        await tx.execute(sql`
          select set_config('request.jwt.claims', ${JSON.stringify(claims)}, true);
          select set_config('request.jwt.claim.sub', ${user?.id ?? ""}, true);
          select set_config('request.guest_code', ${contexto.guestCode ?? ""}, true);
          select set_config('request.invite_token', ${contexto.inviteToken ?? ""}, true);
          set local role ${sql.raw(role)};
        `)
        return await callback(tx)
      } finally {
        await tx.execute(sql`
          select set_config('request.jwt.claims', '', true);
          select set_config('request.guest_code', '', true);
          select set_config('request.invite_token', '', true);
          reset role;
        `)
      }
    })
  }

  return { rls }
}
