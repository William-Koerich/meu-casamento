import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core"

import { comodoEnxovalEnum, prioridadeEnxovalEnum } from "@/db/schema/enums"
import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

export const trousseauItems = pgTable(
  "trousseau_items",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    comodo: comodoEnxovalEnum("comodo").notNull(),
    quantidade: integer("quantidade").default(1).notNull(),
    prioridade: prioridadeEnxovalEnum("prioridade").default("media").notNull(),
    precoEstimado: numeric("preco_estimado", { precision: 12, scale: 2 }),
    comprado: boolean("comprado").default(false).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("trousseau_items_wedding_id_idx").on(table.weddingId),
    ...standardWeddingPolicies("trousseau_items", table.weddingId),
  ]
).enableRLS()
