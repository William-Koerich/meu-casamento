import { sql } from "drizzle-orm"
import { pgPolicy, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { authenticatedRole, authUid, authUsers } from "@/db/schema/auth"
import { createdAt } from "@/db/schema/helpers"

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    avatarUrl: text("avatar_url"),
    telefone: text("telefone"),
    createdAt: createdAt(),
  },
  (table) => [
    pgPolicy("profiles_select_propria_ou_equipe", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      // Além do próprio perfil, cada membro vê o perfil de quem divide algum
      // casamento com ela (para exibir nomes em "responsável", equipe etc.).
      using: sql`
        ${table.id} = ${authUid}
        or exists (
          select 1
          from wedding_members eu
          join wedding_members outra on outra.wedding_id = eu.wedding_id
          where eu.user_id = ${authUid}
            and eu.convite_aceito_em is not null
            and outra.user_id = ${table.id}
            and outra.convite_aceito_em is not null
        )
      `,
    }),
    pgPolicy("profiles_insert_propria", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy("profiles_update_propria", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
      withCheck: sql`${table.id} = ${authUid}`,
    }),
  ]
).enableRLS()
