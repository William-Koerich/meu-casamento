import { index, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { tipoDocumentoEnum } from "@/db/schema/enums"
import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { vendors } from "@/db/schema/vendors"
import { weddings } from "@/db/schema/weddings"

export const documents = pgTable(
  "documents",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    tipo: tipoDocumentoEnum("tipo").notNull(),
    arquivoUrl: text("arquivo_url").notNull(),
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (table) => [
    index("documents_wedding_id_idx").on(table.weddingId),
    index("documents_vendor_id_idx").on(table.vendorId),
    ...standardWeddingPolicies("documents", table.weddingId),
  ]
).enableRLS()
