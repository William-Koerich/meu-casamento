import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  uuid,
} from "drizzle-orm/pg-core"

import { anonRole } from "@/db/schema/auth"
import { blockTipoEnum } from "@/db/schema/enums"
import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

export type BlockConfigFoto = {
  url: string
  posicaoX: number
  posicaoY: number
  zoom: number
}
export type BlockConfigGaleria = { fotos: { url: string }[] }
export type BlockConfigTexto = { titulo: string; corpo: string }
export type BlockConfig = BlockConfigFoto | BlockConfigGaleria | BlockConfigTexto

export const pageBlocks = pgTable(
  "page_blocks",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    tipo: blockTipoEnum("tipo").notNull(),
    ordem: integer("ordem").notNull().default(0),
    visivel: boolean("visivel").notNull().default(true),
    // null pras seções embutidas (historia/nav_*, que só usam dado de
    // weddings/rotas fixas) — só os blocos de conteúdo livre (foto/galeria/
    // texto) guardam algo aqui.
    config: jsonb("config").$type<BlockConfig>(),
    createdAt: createdAt(),
  },
  (table) => [
    index("page_blocks_wedding_id_idx").on(table.weddingId),
    ...standardWeddingPolicies("page_blocks", table.weddingId),
    // Sem PII nessa tabela — ao contrário de weddings/guests/gifts, não
    // precisa de revoke+grant por coluna pra anon (ver "Grants de coluna
    // para anon" no CLAUDE.md), uma policy de linha normal já basta.
    pgPolicy("page_blocks_publico_select", {
      as: "permissive",
      for: "select",
      to: anonRole,
      using: sql`
        ${table.visivel} = true
        and exists (select 1 from weddings w where w.id = ${table.weddingId} and w.publicado = true)
      `,
    }),
  ]
).enableRLS()
