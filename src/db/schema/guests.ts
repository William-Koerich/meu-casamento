import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { anonRole } from "@/db/schema/auth"
import { grupoConvidadoEnum, ladoConvidadoEnum, statusRsvpEnum } from "@/db/schema/enums"
import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { tables } from "@/db/schema/seating"
import { weddings } from "@/db/schema/weddings"

// Condição usada pelo fluxo público de RSVP: o Server Action seta
// `request.guest_code` (via `set_config`, dentro da mesma transação —
// ver src/db/rls.ts) com o código digitado pela pessoa convidada, e essa
// policy só libera a linha cujo `codigo_rsvp` bate com o valor setado.
const guestCodeMatches = sql`(codigo_rsvp = current_setting('request.guest_code', true))`

export const guests = pgTable(
  "guests",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    email: text("email"),
    telefone: text("telefone"),
    grupo: grupoConvidadoEnum("grupo").notNull(),
    lado: ladoConvidadoEnum("lado").notNull(),
    acompanhantes: integer("acompanhantes").default(0).notNull(),
    crianca: boolean("crianca").default(false).notNull(),
    restricaoAlimentar: text("restricao_alimentar"),
    statusRsvp: statusRsvpEnum("status_rsvp").default("pendente").notNull(),
    respondidoEm: timestamp("respondido_em", { withTimezone: true }),
    tableId: uuid("table_id").references(() => tables.id, { onDelete: "set null" }),
    conviteEnviadoEm: timestamp("convite_enviado_em", { withTimezone: true }),
    codigoRsvp: text("codigo_rsvp").notNull().unique(),
    observacoes: text("observacoes"),
    createdAt: createdAt(),
  },
  (table) => [
    index("guests_wedding_id_idx").on(table.weddingId),
    index("guests_table_id_idx").on(table.tableId),
    ...standardWeddingPolicies("guests", table.weddingId),
    pgPolicy("guests_rsvp_publico_select", {
      as: "permissive",
      for: "select",
      to: anonRole,
      using: guestCodeMatches,
    }),
    pgPolicy("guests_rsvp_publico_update", {
      as: "permissive",
      for: "update",
      to: anonRole,
      using: guestCodeMatches,
      withCheck: guestCodeMatches,
    }),
  ]
).enableRLS()
