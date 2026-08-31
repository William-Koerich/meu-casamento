import { sql } from "drizzle-orm"
import { index, pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { anonRole, authenticatedRole, authUid, authUsers } from "@/db/schema/auth"
import { papelMembroEnum, permissaoMembroEnum } from "@/db/schema/enums"
import { createdAt, id } from "@/db/schema/helpers"
import { isWeddingAdmin, isWeddingMember } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

// Usada em duas telas públicas por token, sem depender de já estar logada:
// visualizar o convite em /convite/[token] e aceitá-lo (o Server Action seta
// `request.invite_token` na mesma transação — ver src/db/rls.ts).
const inviteTokenMatches = sql`(convite_token = current_setting('request.invite_token', true))`

export const weddingMembers = pgTable(
  "wedding_members",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => authUsers.id, { onDelete: "cascade" }),
    papel: papelMembroEnum("papel").notNull(),
    permissao: permissaoMembroEnum("permissao").notNull(),
    conviteEmail: text("convite_email").notNull(),
    conviteToken: text("convite_token").notNull().unique(),
    conviteAceitoEm: timestamp("convite_aceito_em", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    index("wedding_members_wedding_id_idx").on(table.weddingId),
    index("wedding_members_user_id_idx").on(table.userId),
    pgPolicy("wedding_members_select_equipe", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: isWeddingMember(table.weddingId),
    }),
    pgPolicy("wedding_members_select_por_token", {
      as: "permissive",
      for: "select",
      to: [anonRole, authenticatedRole],
      using: inviteTokenMatches,
    }),
    pgPolicy("wedding_members_insert_admin", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: isWeddingAdmin(table.weddingId),
    }),
    pgPolicy("wedding_members_update_admin", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: isWeddingAdmin(table.weddingId),
      withCheck: isWeddingAdmin(table.weddingId),
    }),
    pgPolicy("wedding_members_aceitar_convite", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`${inviteTokenMatches} and ${table.userId} is null`,
      withCheck: sql`${table.userId} = ${authUid}`,
    }),
    pgPolicy("wedding_members_delete_admin", {
      as: "permissive",
      for: "delete",
      to: authenticatedRole,
      using: isWeddingAdmin(table.weddingId),
    }),
  ]
).enableRLS()
