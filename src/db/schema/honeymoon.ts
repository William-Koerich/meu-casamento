import { date, jsonb, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

export type RoteiroDia = {
  dia: number
  titulo: string
  atividades: string
}

export type ChecklistMalaItem = {
  item: string
  marcado: boolean
}

export const honeymoon = pgTable(
  "honeymoon",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .unique()
      .references(() => weddings.id, { onDelete: "cascade" }),
    destino: text("destino"),
    dataIda: date("data_ida", { mode: "string" }),
    dataVolta: date("data_volta", { mode: "string" }),
    orcamento: numeric("orcamento", { precision: 12, scale: 2 }),
    roteiro: jsonb("roteiro").$type<RoteiroDia[]>().default([]).notNull(),
    checklistMala: jsonb("checklist_mala")
      .$type<ChecklistMalaItem[]>()
      .default([])
      .notNull(),
    notas: text("notas"),
    createdAt: createdAt(),
  },
  (table) => [...standardWeddingPolicies("honeymoon", table.weddingId)]
).enableRLS()
