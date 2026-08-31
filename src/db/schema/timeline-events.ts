import { index, integer, pgTable, text, time, uuid } from "drizzle-orm/pg-core"

import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

export const timelineEvents = pgTable(
  "timeline_events",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    horario: time("horario").notNull(),
    duracaoMinutos: integer("duracao_minutos").default(30).notNull(),
    titulo: text("titulo").notNull(),
    descricao: text("descricao"),
    responsavel: text("responsavel"),
    local: text("local"),
    ordem: integer("ordem").default(0).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("timeline_events_wedding_id_idx").on(table.weddingId),
    ...standardWeddingPolicies("timeline_events", table.weddingId),
  ]
).enableRLS()
