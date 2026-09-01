import { sql } from "drizzle-orm"
import {
  boolean,
  date,
  integer,
  numeric,
  pgPolicy,
  pgTable,
  text,
  time,
  uuid,
} from "drizzle-orm/pg-core"

import { anonRole, authenticatedRole, authUid, authUsers } from "@/db/schema/auth"
import { createdAt, id, updatedAt } from "@/db/schema/helpers"
import { isWeddingAdmin, isWeddingMember } from "@/db/schema/policy-helpers"

export const weddings = pgTable(
  "weddings",
  {
    id: id(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    nomeNoiva: text("nome_noiva").notNull(),
    nomeNoivo: text("nome_noivo").notNull(),
    dataCasamento: date("data_casamento", { mode: "string" }),
    horaCerimonia: time("hora_cerimonia"),
    localCerimonia: text("local_cerimonia"),
    enderecoCerimonia: text("endereco_cerimonia"),
    localFesta: text("local_festa"),
    enderecoFesta: text("endereco_festa"),
    cidade: text("cidade"),
    estado: text("estado"),
    orcamentoTotal: numeric("orcamento_total", { precision: 12, scale: 2 }),
    convidadosEstimados: integer("convidados_estimados"),
    estilo: text("estilo"),
    historiaCasal: text("historia_casal"),
    fotoCapaUrl: text("foto_capa_url"),
    // Percentual (0-100) usado como object-position da foto de capa — permite
    // arrastar pra reenquadrar sem precisar cortar/reenviar a imagem.
    fotoCapaPosicaoX: integer("foto_capa_posicao_x").notNull().default(50),
    fotoCapaPosicaoY: integer("foto_capa_posicao_y").notNull().default(50),
    // Percentual de zoom (100 = ajuste padrão, sem corte extra além do
    // object-cover; até 300 = aproxima/corta mais). Nunca abaixo de 100
    // porque object-cover já preenche a moldura inteira nesse ponto — "zoom
    // out" além disso deixaria espaço vazio na capa.
    fotoCapaZoom: integer("foto_capa_zoom").notNull().default(100),
    dressCode: text("dress_code"),
    slug: text("slug").notNull().unique(),
    publicado: boolean("publicado").default(false).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    pgPolicy("weddings_select_membros", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: isWeddingMember(table.id),
    }),
    // Vitrine pública: colunas sensíveis (owner_id, orçamento...) ficam de
    // fora via GRANT column-level na migration custom — RLS só cuida da
    // linha (casamento publicado).
    pgPolicy("weddings_select_vitrine_publica", {
      as: "permissive",
      for: "select",
      to: anonRole,
      using: sql`${table.publicado} = true`,
    }),
    pgPolicy("weddings_insert_dona", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${table.ownerId} = ${authUid}`,
    }),
    pgPolicy("weddings_update_admin", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: isWeddingAdmin(table.id),
      withCheck: isWeddingAdmin(table.id),
    }),
    pgPolicy("weddings_delete_dona", {
      as: "permissive",
      for: "delete",
      to: authenticatedRole,
      using: sql`${table.ownerId} = ${authUid}`,
    }),
  ]
).enableRLS()
