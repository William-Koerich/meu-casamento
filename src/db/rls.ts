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

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

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
      // `true` (is_local) em set_config e o "local" de "set local role" já
      // revertem sozinhos ao fim da transação (commit ou rollback) — não dá
      // pra "desfazer" isso num finally: se a query de dentro falhar, a
      // transação já fica abortada e uma query de limpeza aqui só troca o
      // erro real por "current transaction is aborted", escondendo a causa.
      //
      // Cada `set_config` roda numa chamada própria (não junto num só
      // `tx.execute` separado por ";") porque o protocolo estendido do
      // Postgres não aceita várias instruções numa query com parâmetros
      // vinculados — só "set local role", sem parâmetro, pode ir sozinho.
      await tx.execute(
        sql`select set_config('request.jwt.claims', ${JSON.stringify(claims)}, true)`
      )
      await tx.execute(
        sql`select set_config('request.jwt.claim.sub', ${user?.id ?? ""}, true)`
      )
      await tx.execute(
        sql`select set_config('request.guest_code', ${contexto.guestCode ?? ""}, true)`
      )
      await tx.execute(
        sql`select set_config('request.invite_token', ${contexto.inviteToken ?? ""}, true)`
      )
      await tx.execute(sql`set local role ${sql.raw(role)}`)
      return await callback(tx)
    })
  }

  return { rls }
}
