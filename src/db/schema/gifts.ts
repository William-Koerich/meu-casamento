import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  numeric,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { anonRole } from "@/db/schema/auth"
import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

export const gifts = pgTable(
  "gifts",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    descricao: text("descricao"),
    imagemUrl: text("imagem_url"),
    preco: numeric("preco", { precision: 12, scale: 2 }),
    linkLoja: text("link_loja"),
    chavePix: text("chave_pix"),
    reservadoPorNome: text("reservado_por_nome"),
    reservadoPorEmail: text("reservado_por_email"),
    reservadoEm: timestamp("reservado_em", { withTimezone: true }),
    recebido: boolean("recebido").default(false).notNull(),
    // Presente "em cota" (Fase 24): em vez de 1 pessoa reservar o item
    // inteiro, vários convidados declaram quanto vão contribuir
    // (`gift_contributions`) até juntar o valor de `preco` — pensado pra
    // presentes caros tipo lua de mel. Continua sendo "declarado", não
    // dinheiro de verdade passando pela plataforma — mesmo nível de
    // confiança que a reserva normal já tinha (ver decisão no CLAUDE.md).
    aceitaCotas: boolean("aceita_cotas").default(false).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("gifts_wedding_id_idx").on(table.weddingId),
    ...standardWeddingPolicies("gifts", table.weddingId),
    pgPolicy("gifts_publico_select", {
      as: "permissive",
      for: "select",
      to: anonRole,
      using: sql`exists (select 1 from weddings w where w.id = ${table.weddingId} and w.publicado = true)`,
    }),
    pgPolicy("gifts_publico_reservar", {
      as: "permissive",
      for: "update",
      to: anonRole,
      using: sql`
        reservado_por_email is null
        and exists (select 1 from weddings w where w.id = ${table.weddingId} and w.publicado = true)
      `,
      withCheck: sql`exists (select 1 from weddings w where w.id = ${table.weddingId} and w.publicado = true)`,
    }),
  ]
).enableRLS()
