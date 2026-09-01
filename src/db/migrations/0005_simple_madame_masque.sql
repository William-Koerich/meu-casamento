ALTER TABLE "weddings" ADD COLUMN "foto_capa_zoom" integer DEFAULT 100 NOT NULL;--> statement-breakpoint

-- Mesmo motivo da migration 0004: coluna nova em "weddings" precisa entrar
-- na allowlist de "anon" (migration 0001) pra não quebrar a leitura pública.
grant select (foto_capa_zoom) on public.weddings to anon;