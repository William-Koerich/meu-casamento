import { index, integer, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { categoriaEnum, statusFornecedorEnum } from "@/db/schema/enums"
import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

export const vendors = pgTable(
  "vendors",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    categoria: categoriaEnum("categoria").notNull(),
    contatoNome: text("contato_nome"),
    telefone: text("telefone"),
    email: text("email"),
    instagram: text("instagram"),
    site: text("site"),
    valorProposto: numeric("valor_proposto", { precision: 12, scale: 2 }),
    status: statusFornecedorEnum("status").default("pesquisando").notNull(),
    avaliacao: integer("avaliacao"),
    observacoes: text("observacoes"),
    createdAt: createdAt(),
  },
  (table) => [
    index("vendors_wedding_id_idx").on(table.weddingId),
    ...standardWeddingPolicies("vendors", table.weddingId),
  ]
).enableRLS()
