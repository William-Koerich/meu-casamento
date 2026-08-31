import "dotenv/config"
import { defineConfig } from "drizzle-kit"

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
