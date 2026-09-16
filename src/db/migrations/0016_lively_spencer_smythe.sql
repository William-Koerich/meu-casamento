ALTER TABLE "weddings" ADD COLUMN "pagina_markdown_ativa" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "weddings" ADD COLUMN "pagina_markdown" text;--> statement-breakpoint
ALTER TABLE "weddings" ADD COLUMN "pagina_fundo_url" text;--> statement-breakpoint

-- 3 colunas novas em "weddings" precisam entrar nas duas allowlists já
-- existentes (ver "Grants de coluna para anon" e a migration 0011 que
-- revogou UPDATE de tabela inteira da role "authenticated") — sem isso a
-- leitura pública (anon) e a gravação pela dona (authenticated, via rls())
-- quebrariam com "permission denied" sem nenhum erro em build/typecheck.
grant select (pagina_markdown_ativa, pagina_markdown, pagina_fundo_url) on public.weddings to anon;
grant update (pagina_markdown_ativa, pagina_markdown, pagina_fundo_url) on public.weddings to authenticated;