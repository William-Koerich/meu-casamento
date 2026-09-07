import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { notaCorEnum } from "@/db/schema/enums"
import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

// Post-its livres pra organizar lembretes soltos — sem título, sem prazo,
// sem categoria: só um texto curto e uma cor, num quadro que a dona arrasta
// como quiser. Não substitui o checklist (que já cobre tarefa com prazo).
export const notes = pgTable(
  "notes",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    conteudo: text("conteudo").notNull().default(""),
    cor: notaCorEnum("cor").notNull().default("amarelo"),
    ordem: integer("ordem").default(0).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("notes_wedding_id_idx").on(table.weddingId),
    ...standardWeddingPolicies("notes", table.weddingId),
  ]
).enableRLS()
