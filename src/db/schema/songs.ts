import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { momentoMusicaEnum } from "@/db/schema/enums"
import { createdAt, id } from "@/db/schema/helpers"
import { standardWeddingPolicies } from "@/db/schema/policy-helpers"
import { weddings } from "@/db/schema/weddings"

export const songs = pgTable(
  "songs",
  {
    id: id(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    titulo: text("titulo").notNull(),
    artista: text("artista"),
    momento: momentoMusicaEnum("momento").notNull(),
    spotifyUrl: text("spotify_url"),
    ordem: integer("ordem").default(0).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("songs_wedding_id_idx").on(table.weddingId),
    ...standardWeddingPolicies("songs", table.weddingId),
  ]
).enableRLS()
