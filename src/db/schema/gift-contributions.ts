import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  numeric,
  pgPolicy,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core"

import { anonRole } from "@/db/schema/auth"
import { gifts } from "@/db/schema/gifts"
import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

// Uma contribuição declarada por um convidado num presente "de cota" (ver
// `gifts.aceitaCotas`). `weddingId` denormalizado igual `payments` faz com
// `budgetItemId`/`weddingId` — permite reaproveitar `standardWeddingPolicies`
// sem precisar de subquery até `gifts` pra achar o dono.
export const giftContributions = pgTable(
  "gift_contributions",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    giftId: uuid("gift_id")
      .notNull()
      .references(() => gifts.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    email: text("email").notNull(),
    valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
    // Conferência manual da dona (mesmo espírito de `gifts.recebido`) — o
    // valor declarado aqui não é dinheiro de verdade passando pela
    // plataforma, só o registro de quem disse que ia contribuir e quanto.
    recebido: boolean("recebido").default(false).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("gift_contributions_wedding_id_idx").on(table.weddingId),
    index("gift_contributions_gift_id_idx").on(table.giftId),
    ...standardWeddingPolicies("gift_contributions", table.weddingId),
    // Convidado contribui sem login — só quando o presente aceita cota e o
    // casamento está publicado. Sem policy de SELECT pra anon (nunca lê de
    // volta, evita expor e-mail de outros convidados) — mesmo padrão de
    // `guest_photos` (Fase 11): INSERT liberado, SELECT fechado. O total
    // arrecadado que aparece pro público vem de uma função `security
    // definer` (`total_contribuido_presentes`, migration à parte), não de
    // uma policy de SELECT aqui.
    pgPolicy("gift_contributions_publico_inserir", {
      as: "permissive",
      for: "insert",
      to: anonRole,
      withCheck: sql`exists (
        select 1 from gifts g
        join weddings w on w.id = g.wedding_id
        where g.id = ${table.giftId}
          and g.wedding_id = ${table.weddingId}
          and g.aceita_cotas = true
          and w.publicado = true
      )`,
    }),
  ]
).enableRLS()
