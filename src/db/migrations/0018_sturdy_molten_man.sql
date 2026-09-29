CREATE TABLE "gift_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"gift_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"recebido" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gift_contributions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gifts" ADD COLUMN "aceita_cotas" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "gift_contributions" ADD CONSTRAINT "gift_contributions_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_contributions" ADD CONSTRAINT "gift_contributions_gift_id_gifts_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gifts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gift_contributions_wedding_id_idx" ON "gift_contributions" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "gift_contributions_gift_id_idx" ON "gift_contributions" USING btree ("gift_id");--> statement-breakpoint
CREATE POLICY "gift_contributions_select" ON "gift_contributions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("gift_contributions"."wedding_id")));--> statement-breakpoint
CREATE POLICY "gift_contributions_insert" ON "gift_contributions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("gift_contributions"."wedding_id")));--> statement-breakpoint
CREATE POLICY "gift_contributions_update" ON "gift_contributions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("gift_contributions"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("gift_contributions"."wedding_id")));--> statement-breakpoint
CREATE POLICY "gift_contributions_delete" ON "gift_contributions" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("gift_contributions"."wedding_id")));--> statement-breakpoint
CREATE POLICY "gift_contributions_publico_inserir" ON "gift_contributions" AS PERMISSIVE FOR INSERT TO "anon" WITH CHECK (exists (
        select 1 from gifts g
        join weddings w on w.id = g.wedding_id
        where g.id = "gift_contributions"."gift_id"
          and g.wedding_id = "gift_contributions"."wedding_id"
          and g.aceita_cotas = true
          and w.publicado = true
      ));--> statement-breakpoint

-- Coluna nova em "gifts" precisa entrar na allowlist de "anon" (migration
-- 0001) — sem isso a leitura pública de /c/[slug]/presentes quebraria com
-- "permission denied" (ver "Grants de coluna para anon" no CLAUDE.md).
grant select (aceita_cotas) on public.gifts to anon;--> statement-breakpoint

-- Total já contribuído por presente, pro público ver o progresso da cota
-- sem enxergar quem contribuiu quanto (sem policy de SELECT pra anon em
-- "gift_contributions" — ver comentário na policy de insert acima). Mesmo
-- padrão de "buscar_convidados_publico" (migration 0003): função security
-- definer devolvendo só o agregado, nunca as linhas.
create or replace function public.total_contribuido_presentes(p_wedding_id uuid)
returns table (gift_id uuid, total numeric)
language sql
security definer
set search_path = public
stable
as $$
  select gc.gift_id, coalesce(sum(gc.valor), 0) as total
  from public.gift_contributions gc
  where gc.wedding_id = p_wedding_id
  group by gc.gift_id;
$$;

grant execute on function public.total_contribuido_presentes(uuid) to anon, authenticated;