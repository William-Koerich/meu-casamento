CREATE TYPE "public"."block_tipo" AS ENUM('historia', 'nav_rsvp', 'nav_presentes', 'nav_local', 'foto', 'galeria', 'texto');--> statement-breakpoint
CREATE TABLE "page_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"tipo" "block_tipo" NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"visivel" boolean DEFAULT true NOT NULL,
	"config" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "page_blocks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "page_blocks_wedding_id_idx" ON "page_blocks" USING btree ("wedding_id");--> statement-breakpoint
CREATE POLICY "page_blocks_select" ON "page_blocks" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("page_blocks"."wedding_id")));--> statement-breakpoint
CREATE POLICY "page_blocks_insert" ON "page_blocks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("page_blocks"."wedding_id")));--> statement-breakpoint
CREATE POLICY "page_blocks_update" ON "page_blocks" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("page_blocks"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("page_blocks"."wedding_id")));--> statement-breakpoint
CREATE POLICY "page_blocks_delete" ON "page_blocks" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("page_blocks"."wedding_id")));--> statement-breakpoint
CREATE POLICY "page_blocks_publico_select" ON "page_blocks" AS PERMISSIVE FOR SELECT TO "anon" USING (
        "page_blocks"."visivel" = true
        and exists (select 1 from weddings w where w.id = "page_blocks"."wedding_id" and w.publicado = true)
      );

-- Bucket novo pras imagens dos blocos "foto"/"galeria" — mesmo padrão de
-- "capas"/"presentes" (migration 0001): público (a página /c/[slug] exibe
-- sem autenticação), path "{wedding_id}/arquivo.ext".
insert into storage.buckets (id, name, public)
values ('blocos', 'blocos', true)
on conflict (id) do nothing;

create policy "blocos_leitura_publica"
on storage.objects for select
to public
using (bucket_id = 'blocos');

create policy "blocos_escrita_equipe"
on storage.objects for all
to authenticated
using (bucket_id = 'blocos' and public.can_edit_wedding(((storage.foldername(name))[1])::uuid))
with check (bucket_id = 'blocos' and public.can_edit_wedding(((storage.foldername(name))[1])::uuid));