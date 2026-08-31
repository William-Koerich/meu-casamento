import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { vendors } from "@/db/schema/vendors"
import { weddings } from "@/db/schema/weddings"

export const budgetCategories = pgTable(
  "budget_categories",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    valorPrevisto: numeric("valor_previsto", { precision: 12, scale: 2 }).notNull(),
    cor: text("cor"),
    ordem: integer("ordem").default(0).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("budget_categories_wedding_id_idx").on(table.weddingId),
    ...standardWeddingPolicies("budget_categories", table.weddingId),
  ]
).enableRLS()

export const budgetItems = pgTable(
  "budget_items",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => budgetCategories.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
    descricao: text("descricao").notNull(),
    valorPrevisto: numeric("valor_previsto", { precision: 12, scale: 2 }),
    valorContratado: numeric("valor_contratado", { precision: 12, scale: 2 }),
    createdAt: createdAt(),
  },
  (table) => [
    index("budget_items_wedding_id_idx").on(table.weddingId),
    index("budget_items_category_id_idx").on(table.categoryId),
    index("budget_items_vendor_id_idx").on(table.vendorId),
    ...standardWeddingPolicies("budget_items", table.weddingId),
  ]
).enableRLS()

export const payments = pgTable(
  "payments",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    budgetItemId: uuid("budget_item_id")
      .notNull()
      .references(() => budgetItems.id, { onDelete: "cascade" }),
    descricao: text("descricao").notNull(),
    valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
    vencimento: date("vencimento", { mode: "string" }).notNull(),
    pago: boolean("pago").default(false).notNull(),
    pagoEm: timestamp("pago_em", { withTimezone: true }),
    formaPagamento: text("forma_pagamento"),
    createdAt: createdAt(),
  },
  (table) => [
    index("payments_wedding_id_idx").on(table.weddingId),
    index("payments_budget_item_id_idx").on(table.budgetItemId),
    ...standardWeddingPolicies("payments", table.weddingId),
  ]
).enableRLS()
