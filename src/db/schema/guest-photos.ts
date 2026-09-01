import { sql } from "drizzle-orm"
import { index, pgPolicy, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { anonRole } from "@/db/schema/auth"
import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

// Fotos que os próprios convidados sobem pelo link/QR code público — pra
// visualização e download só da equipe do casamento, os convidados não
// veem as fotos uns dos outros (só enviam, não é uma galeria compartilhada).
export const guestPhotos = pgTable(
  "guest_photos",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    caminho: text("caminho").notNull(),
    nomeConvidado: text("nome_convidado"),
    createdAt: createdAt(),
  },
  (table) => [
    index("guest_photos_wedding_id_idx").on(table.weddingId),
    ...standardWeddingPolicies("guest_photos", table.weddingId),
    pgPolicy("guest_photos_publico_insert", {
      as: "permissive",
      for: "insert",
      to: anonRole,
      withCheck: sql`exists (select 1 from weddings w where w.id = ${table.weddingId} and w.publicado = true)`,
    }),
  ]
).enableRLS()
