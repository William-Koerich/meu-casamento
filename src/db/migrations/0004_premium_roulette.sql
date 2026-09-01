ALTER TABLE "weddings" ADD COLUMN "foto_capa_posicao_x" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "weddings" ADD COLUMN "foto_capa_posicao_y" integer DEFAULT 50 NOT NULL;--> statement-breakpoint

-- O grant de coluna pra "anon" (migration 0001) é uma allowlist explícita —
-- colunas novas não entram sozinhas, precisam ser adicionadas aqui também
-- (ver decisão "Queries públicas sempre limitam columns" no CLAUDE.md).
grant select (foto_capa_posicao_x, foto_capa_posicao_y) on public.weddings to anon;