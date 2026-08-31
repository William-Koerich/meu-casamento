import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

// drizzle-kit não segue a convenção do Next.js de carregar .env.local
// automaticamente — carregamos à mão (não falha se o arquivo não existir,
// como em CI onde as variáveis já vêm do ambiente).
config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definida. Copie .env.example para .env.local.")
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
})
