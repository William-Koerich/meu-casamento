import { index, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

export const inspirations = pgTable(
  "inspirations",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    titulo: text("titulo"),
    imagemUrl: text("imagem_url"),
    linkExterno: text("link_externo"),
    categoria: text("categoria"),
    notas: text("notas"),
    createdAt: createdAt(),
  },
  (table) => [
    index("inspirations_wedding_id_idx").on(table.weddingId),
    ...standardWeddingPolicies("inspirations", table.weddingId),
  ]
).enableRLS()
