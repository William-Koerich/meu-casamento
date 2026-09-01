CREATE TABLE "guest_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"caminho" text NOT NULL,
	"nome_convidado" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guest_photos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "guest_photos" ADD CONSTRAINT "guest_photos_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guest_photos_wedding_id_idx" ON "guest_photos" USING btree ("wedding_id");--> statement-breakpoint
CREATE POLICY "guest_photos_select" ON "guest_photos" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("guest_photos"."wedding_id")));--> statement-breakpoint
CREATE POLICY "guest_photos_insert" ON "guest_photos" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("guest_photos"."wedding_id")));--> statement-breakpoint
CREATE POLICY "guest_photos_update" ON "guest_photos" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("guest_photos"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("guest_photos"."wedding_id")));--> statement-breakpoint
CREATE POLICY "guest_photos_delete" ON "guest_photos" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("guest_photos"."wedding_id")));--> statement-breakpoint
CREATE POLICY "guest_photos_publico_insert" ON "guest_photos" AS PERMISSIVE FOR INSERT TO "anon" WITH CHECK (exists (select 1 from weddings w where w.id = "guest_photos"."wedding_id" and w.publicado = true));

-- Bucket novo pras fotos que os convidados sobem (QR code em
-- /c/[slug]/fotos) — privado, como "inspiracoes"/"documentos": só a
-- equipe do casamento visualiza (signed URL via obterUrlsAssinadas), os
-- convidados só têm permissão de enviar, nunca de listar/ler.
insert into storage.buckets (id, name, public)
values ('fotos-convidados', 'fotos-convidados', false)
on conflict (id) do nothing;

create policy "fotos_convidados_upload_publico"
on storage.objects for insert
to anon
with check (
  bucket_id = 'fotos-convidados'
  and exists (
    select 1 from weddings w
    where w.id = ((storage.foldername(name))[1])::uuid and w.publicado = true
  )
);

create policy "fotos_convidados_leitura_equipe"
on storage.objects for select
to authenticated
using (bucket_id = 'fotos-convidados' and public.is_wedding_member(((storage.foldername(name))[1])::uuid));

create policy "fotos_convidados_gestao_equipe"
on storage.objects for all
to authenticated
using (bucket_id = 'fotos-convidados' and public.can_edit_wedding(((storage.foldername(name))[1])::uuid))
with check (bucket_id = 'fotos-convidados' and public.can_edit_wedding(((storage.foldername(name))[1])::uuid));