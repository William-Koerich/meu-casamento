import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core"

// Contador de limite de taxa pras rotas públicas sem login (RSVP, reservar
// presente, upload de foto de convidado, busca de convidado, aceitar
// convite — ver decisão "Proteção contra abuso" no CLAUDE.md). Sem PII, sem
// vínculo com `weddings` — não é filha de nenhum casamento, então não usa
// `standardWeddingPolicies`. `.enableRLS()` sem nenhuma `pgPolicy` nega
// acesso por padrão pras roles `anon`/`authenticated` (a única forma de ler/
// escrever aqui é pelo client administrativo, que ignora RLS por ser dono
// da tabela — mesma exceção já documentada pra `profiles.stripeCustomerId`
// em `src/db/index.ts`).
export const rateLimits = pgTable(
  "rate_limits",
  {
    chave: text("chave").notNull(),
    // Janela de tempo truncada (epoch em segundos / duração da janela) —
    // inteiro simples em vez de timestamp, mais barato de comparar/indexar.
    janela: integer("janela").notNull(),
    contagem: integer("contagem").default(1).notNull(),
  },
  (table) => [primaryKey({ columns: [table.chave, table.janela] })]
).enableRLS()
