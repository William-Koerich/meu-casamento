import { config } from "dotenv"

// Import isso ANTES de qualquer outro import que leia process.env no topo do
// módulo (como "@/db", que monta a connection string ao ser importado) — o
// Next.js carrega .env.local sozinho, mas scripts rodados via tsx (seed,
// drizzle-kit) não seguem essa convenção.
config({ path: ".env.local" })
