import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { authUsers } from "@/db/schema/auth"
import { categoriaEnum, origemTarefaEnum } from "@/db/schema/enums"
import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

export const tasks = pgTable(
  "tasks",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    titulo: text("titulo").notNull(),
    descricao: text("descricao"),
    categoria: categoriaEnum("categoria").notNull(),
    mesesAntes: integer("meses_antes"),
    prazo: date("prazo", { mode: "string" }),
    concluida: boolean("concluida").default(false).notNull(),
    concluidaEm: timestamp("concluida_em", { withTimezone: true }),
    responsavelId: uuid("responsavel_id").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    ordem: integer("ordem").default(0).notNull(),
    origem: origemTarefaEnum("origem").default("manual").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("tasks_wedding_id_idx").on(table.weddingId),
    index("tasks_responsavel_id_idx").on(table.responsavelId),
    ...standardWeddingPolicies("tasks", table.weddingId),
  ]
).enableRLS()
