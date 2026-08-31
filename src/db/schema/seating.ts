import { index, integer, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { formatoMesaEnum } from "@/db/schema/enums"
import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

export const tables = pgTable(
  "tables",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    capacidade: integer("capacidade").notNull(),
    formato: formatoMesaEnum("formato").default("redonda").notNull(),
    posX: numeric("pos_x", { precision: 10, scale: 2 }).default("0").notNull(),
    posY: numeric("pos_y", { precision: 10, scale: 2 }).default("0").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("tables_wedding_id_idx").on(table.weddingId),
    ...standardWeddingPolicies("tables", table.weddingId),
  ]
).enableRLS()
