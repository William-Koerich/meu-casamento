-- Funções auxiliares de RLS, policies de todas as tabelas, triggers e
-- configuração do Storage. Ver CLAUDE.md > "Acesso a dados" para o racional
-- de cada decisão.

-- ---------------------------------------------------------------------------
-- 1. Funções de autorização (security definer: o dono das tabelas —
--    a role usada nas migrations — ignora RLS ao consultar weddings e
--    wedding_members dentro delas, o que evita recursão entre as policies).
-- ---------------------------------------------------------------------------

create or replace function public.is_wedding_member(p_wedding_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.weddings w
    where w.id = p_wedding_id and w.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.wedding_members m
    where m.wedding_id = p_wedding_id
      and m.user_id = auth.uid()
      and m.convite_aceito_em is not null
  );
$$;

create or replace function public.can_edit_wedding(p_wedding_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.weddings w
    where w.id = p_wedding_id and w.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.wedding_members m
    where m.wedding_id = p_wedding_id
      and m.user_id = auth.uid()
      and m.convite_aceito_em is not null
      and m.permissao in ('admin', 'editor')
  );
$$;

create or replace function public.is_wedding_admin(p_wedding_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.weddings w
    where w.id = p_wedding_id and w.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.wedding_members m
    where m.wedding_id = p_wedding_id
      and m.user_id = auth.uid()
      and m.convite_aceito_em is not null
      and m.permissao = 'admin'
  );
$$;

grant execute on function public.is_wedding_member(uuid) to authenticated, anon;
grant execute on function public.can_edit_wedding(uuid) to authenticated, anon;
grant execute on function public.is_wedding_admin(uuid) to authenticated, anon;
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- 2. Policies (dependem das funções acima, por isso vêm nesta migration em
--    vez da 0000 gerada pelo drizzle-kit).
-- ---------------------------------------------------------------------------

CREATE POLICY "profiles_select_propria_ou_equipe" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        "profiles"."id" = (select auth.uid())
        or exists (
          select 1
          from wedding_members eu
          join wedding_members outra on outra.wedding_id = eu.wedding_id
          where eu.user_id = (select auth.uid())
            and eu.convite_aceito_em is not null
            and outra.user_id = "profiles"."id"
            and outra.convite_aceito_em is not null
        )
      );--> statement-breakpoint
CREATE POLICY "profiles_insert_propria" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("profiles"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profiles_update_propria" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("profiles"."id" = (select auth.uid())) WITH CHECK ("profiles"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "weddings_select_membros" ON "weddings" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("weddings"."id")));--> statement-breakpoint
CREATE POLICY "weddings_select_vitrine_publica" ON "weddings" AS PERMISSIVE FOR SELECT TO "anon" USING ("weddings"."publicado" = true);--> statement-breakpoint
CREATE POLICY "weddings_insert_dona" ON "weddings" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("weddings"."owner_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "weddings_update_admin" ON "weddings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.is_wedding_admin("weddings"."id"))) WITH CHECK ((select public.is_wedding_admin("weddings"."id")));--> statement-breakpoint
CREATE POLICY "weddings_delete_dona" ON "weddings" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("weddings"."owner_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "wedding_members_select_equipe" ON "wedding_members" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("wedding_members"."wedding_id")));--> statement-breakpoint
CREATE POLICY "wedding_members_select_por_token" ON "wedding_members" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING ((convite_token = current_setting('request.invite_token', true)));--> statement-breakpoint
CREATE POLICY "wedding_members_insert_admin" ON "wedding_members" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.is_wedding_admin("wedding_members"."wedding_id")));--> statement-breakpoint
CREATE POLICY "wedding_members_update_admin" ON "wedding_members" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.is_wedding_admin("wedding_members"."wedding_id"))) WITH CHECK ((select public.is_wedding_admin("wedding_members"."wedding_id")));--> statement-breakpoint
CREATE POLICY "wedding_members_aceitar_convite" ON "wedding_members" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((convite_token = current_setting('request.invite_token', true)) and "wedding_members"."user_id" is null) WITH CHECK ("wedding_members"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "wedding_members_delete_admin" ON "wedding_members" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.is_wedding_admin("wedding_members"."wedding_id")));--> statement-breakpoint
CREATE POLICY "tasks_select" ON "tasks" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("tasks"."wedding_id")));--> statement-breakpoint
CREATE POLICY "tasks_insert" ON "tasks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("tasks"."wedding_id")));--> statement-breakpoint
CREATE POLICY "tasks_update" ON "tasks" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("tasks"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("tasks"."wedding_id")));--> statement-breakpoint
CREATE POLICY "tasks_delete" ON "tasks" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("tasks"."wedding_id")));--> statement-breakpoint
CREATE POLICY "vendors_select" ON "vendors" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("vendors"."wedding_id")));--> statement-breakpoint
CREATE POLICY "vendors_insert" ON "vendors" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("vendors"."wedding_id")));--> statement-breakpoint
CREATE POLICY "vendors_update" ON "vendors" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("vendors"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("vendors"."wedding_id")));--> statement-breakpoint
CREATE POLICY "vendors_delete" ON "vendors" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("vendors"."wedding_id")));--> statement-breakpoint
CREATE POLICY "budget_categories_select" ON "budget_categories" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("budget_categories"."wedding_id")));--> statement-breakpoint
CREATE POLICY "budget_categories_insert" ON "budget_categories" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("budget_categories"."wedding_id")));--> statement-breakpoint
CREATE POLICY "budget_categories_update" ON "budget_categories" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("budget_categories"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("budget_categories"."wedding_id")));--> statement-breakpoint
CREATE POLICY "budget_categories_delete" ON "budget_categories" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("budget_categories"."wedding_id")));--> statement-breakpoint
CREATE POLICY "budget_items_select" ON "budget_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("budget_items"."wedding_id")));--> statement-breakpoint
CREATE POLICY "budget_items_insert" ON "budget_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("budget_items"."wedding_id")));--> statement-breakpoint
CREATE POLICY "budget_items_update" ON "budget_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("budget_items"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("budget_items"."wedding_id")));--> statement-breakpoint
CREATE POLICY "budget_items_delete" ON "budget_items" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("budget_items"."wedding_id")));--> statement-breakpoint
CREATE POLICY "payments_select" ON "payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("payments"."wedding_id")));--> statement-breakpoint
CREATE POLICY "payments_insert" ON "payments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("payments"."wedding_id")));--> statement-breakpoint
CREATE POLICY "payments_update" ON "payments" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("payments"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("payments"."wedding_id")));--> statement-breakpoint
CREATE POLICY "payments_delete" ON "payments" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("payments"."wedding_id")));--> statement-breakpoint
CREATE POLICY "tables_select" ON "tables" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("tables"."wedding_id")));--> statement-breakpoint
CREATE POLICY "tables_insert" ON "tables" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("tables"."wedding_id")));--> statement-breakpoint
CREATE POLICY "tables_update" ON "tables" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("tables"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("tables"."wedding_id")));--> statement-breakpoint
CREATE POLICY "tables_delete" ON "tables" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("tables"."wedding_id")));--> statement-breakpoint
CREATE POLICY "guests_select" ON "guests" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("guests"."wedding_id")));--> statement-breakpoint
CREATE POLICY "guests_insert" ON "guests" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("guests"."wedding_id")));--> statement-breakpoint
CREATE POLICY "guests_update" ON "guests" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("guests"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("guests"."wedding_id")));--> statement-breakpoint
CREATE POLICY "guests_delete" ON "guests" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("guests"."wedding_id")));--> statement-breakpoint
CREATE POLICY "guests_rsvp_publico_select" ON "guests" AS PERMISSIVE FOR SELECT TO "anon" USING ((codigo_rsvp = current_setting('request.guest_code', true)));--> statement-breakpoint
CREATE POLICY "guests_rsvp_publico_update" ON "guests" AS PERMISSIVE FOR UPDATE TO "anon" USING ((codigo_rsvp = current_setting('request.guest_code', true))) WITH CHECK ((codigo_rsvp = current_setting('request.guest_code', true)));--> statement-breakpoint
CREATE POLICY "timeline_events_select" ON "timeline_events" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("timeline_events"."wedding_id")));--> statement-breakpoint
CREATE POLICY "timeline_events_insert" ON "timeline_events" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("timeline_events"."wedding_id")));--> statement-breakpoint
CREATE POLICY "timeline_events_update" ON "timeline_events" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("timeline_events"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("timeline_events"."wedding_id")));--> statement-breakpoint
CREATE POLICY "timeline_events_delete" ON "timeline_events" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("timeline_events"."wedding_id")));--> statement-breakpoint
CREATE POLICY "inspirations_select" ON "inspirations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("inspirations"."wedding_id")));--> statement-breakpoint
CREATE POLICY "inspirations_insert" ON "inspirations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("inspirations"."wedding_id")));--> statement-breakpoint
CREATE POLICY "inspirations_update" ON "inspirations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("inspirations"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("inspirations"."wedding_id")));--> statement-breakpoint
CREATE POLICY "inspirations_delete" ON "inspirations" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("inspirations"."wedding_id")));--> statement-breakpoint
CREATE POLICY "songs_select" ON "songs" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("songs"."wedding_id")));--> statement-breakpoint
CREATE POLICY "songs_insert" ON "songs" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("songs"."wedding_id")));--> statement-breakpoint
CREATE POLICY "songs_update" ON "songs" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("songs"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("songs"."wedding_id")));--> statement-breakpoint
CREATE POLICY "songs_delete" ON "songs" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("songs"."wedding_id")));--> statement-breakpoint
CREATE POLICY "gifts_select" ON "gifts" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("gifts"."wedding_id")));--> statement-breakpoint
CREATE POLICY "gifts_insert" ON "gifts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("gifts"."wedding_id")));--> statement-breakpoint
CREATE POLICY "gifts_update" ON "gifts" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("gifts"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("gifts"."wedding_id")));--> statement-breakpoint
CREATE POLICY "gifts_delete" ON "gifts" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("gifts"."wedding_id")));--> statement-breakpoint
CREATE POLICY "gifts_publico_select" ON "gifts" AS PERMISSIVE FOR SELECT TO "anon" USING (exists (select 1 from weddings w where w.id = "gifts"."wedding_id" and w.publicado = true));--> statement-breakpoint
CREATE POLICY "gifts_publico_reservar" ON "gifts" AS PERMISSIVE FOR UPDATE TO "anon" USING (
        reservado_por_email is null
        and exists (select 1 from weddings w where w.id = "gifts"."wedding_id" and w.publicado = true)
      ) WITH CHECK (exists (select 1 from weddings w where w.id = "gifts"."wedding_id" and w.publicado = true));--> statement-breakpoint
CREATE POLICY "trousseau_items_select" ON "trousseau_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("trousseau_items"."wedding_id")));--> statement-breakpoint
CREATE POLICY "trousseau_items_insert" ON "trousseau_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("trousseau_items"."wedding_id")));--> statement-breakpoint
CREATE POLICY "trousseau_items_update" ON "trousseau_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("trousseau_items"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("trousseau_items"."wedding_id")));--> statement-breakpoint
CREATE POLICY "trousseau_items_delete" ON "trousseau_items" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("trousseau_items"."wedding_id")));--> statement-breakpoint
CREATE POLICY "honeymoon_select" ON "honeymoon" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("honeymoon"."wedding_id")));--> statement-breakpoint
CREATE POLICY "honeymoon_insert" ON "honeymoon" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("honeymoon"."wedding_id")));--> statement-breakpoint
CREATE POLICY "honeymoon_update" ON "honeymoon" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("honeymoon"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("honeymoon"."wedding_id")));--> statement-breakpoint
CREATE POLICY "honeymoon_delete" ON "honeymoon" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("honeymoon"."wedding_id")));--> statement-breakpoint
CREATE POLICY "documents_select" ON "documents" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("documents"."wedding_id")));--> statement-breakpoint
CREATE POLICY "documents_insert" ON "documents" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("documents"."wedding_id")));--> statement-breakpoint
CREATE POLICY "documents_update" ON "documents" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("documents"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("documents"."wedding_id")));--> statement-breakpoint
CREATE POLICY "documents_delete" ON "documents" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("documents"."wedding_id")));--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- 3. Trigger de updated_at (única tabela com essa coluna: weddings).
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger weddings_set_updated_at
before update on public.weddings
for each row
execute function public.set_updated_at();
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- 4. Cria a linha de profiles automaticamente quando uma conta é criada no
--    Supabase Auth (security definer para poder escrever em public.profiles
--    mesmo antes de qualquer policy de insert avaliar a sessão do usuário).
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- 5. Restrição de colunas para `anon`. Por padrão o Supabase concede
--    privilégios amplos de tabela a `anon`/`authenticated` e deixa a RLS
--    filtrar linhas — mas RLS não filtra colunas, então aqui revogamos tudo
--    de `anon` nas 4 tabelas com exceção pública e liberamos de volta só as
--    colunas que fazem sentido expor (nunca e-mail/telefone de terceiros,
--    nunca orçamento, nunca observações internas).
-- ---------------------------------------------------------------------------

revoke all on table public.weddings from anon;
grant select (
  id, nome_noiva, nome_noivo, data_casamento, hora_cerimonia, local_cerimonia,
  endereco_cerimonia, local_festa, endereco_festa, cidade, estado, estilo,
  historia_casal, foto_capa_url, dress_code, slug, publicado
) on public.weddings to anon;

revoke all on table public.guests from anon;
grant select (
  id, wedding_id, nome, grupo, lado, acompanhantes, crianca,
  restricao_alimentar, status_rsvp, codigo_rsvp
) on public.guests to anon;
grant update (
  status_rsvp, acompanhantes, crianca, restricao_alimentar, respondido_em
) on public.guests to anon;

revoke all on table public.gifts from anon;
grant select (
  id, wedding_id, nome, descricao, imagem_url, preco, link_loja, chave_pix,
  reservado_por_nome, recebido
) on public.gifts to anon;
grant update (
  reservado_por_nome, reservado_por_email, reservado_em
) on public.gifts to anon;

revoke all on table public.wedding_members from anon;
grant select (
  id, wedding_id, papel, permissao, convite_email, convite_token, convite_aceito_em
) on public.wedding_members to anon;
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- 6. Storage: buckets e policies. `capas` e `presentes` são lidos na página
--    pública do casal, por isso são buckets públicos; `inspiracoes` e
--    `documentos` são privados à equipe do casamento. Convenção de path:
--    "{wedding_id}/arquivo.ext" — o 1º segmento do path é o wedding_id.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('capas', 'capas', true),
  ('presentes', 'presentes', true),
  ('inspiracoes', 'inspiracoes', false),
  ('documentos', 'documentos', false)
on conflict (id) do nothing;

create policy "capas_leitura_publica"
on storage.objects for select
to public
using (bucket_id = 'capas');

create policy "capas_escrita_equipe"
on storage.objects for all
to authenticated
using (bucket_id = 'capas' and public.can_edit_wedding(((storage.foldername(name))[1])::uuid))
with check (bucket_id = 'capas' and public.can_edit_wedding(((storage.foldername(name))[1])::uuid));

create policy "presentes_leitura_publica"
on storage.objects for select
to public
using (bucket_id = 'presentes');

create policy "presentes_escrita_equipe"
on storage.objects for all
to authenticated
using (bucket_id = 'presentes' and public.can_edit_wedding(((storage.foldername(name))[1])::uuid))
with check (bucket_id = 'presentes' and public.can_edit_wedding(((storage.foldername(name))[1])::uuid));

create policy "inspiracoes_leitura_equipe"
on storage.objects for select
to authenticated
using (bucket_id = 'inspiracoes' and public.is_wedding_member(((storage.foldername(name))[1])::uuid));

create policy "inspiracoes_escrita_equipe"
on storage.objects for all
to authenticated
using (bucket_id = 'inspiracoes' and public.can_edit_wedding(((storage.foldername(name))[1])::uuid))
with check (bucket_id = 'inspiracoes' and public.can_edit_wedding(((storage.foldername(name))[1])::uuid));

create policy "documentos_leitura_equipe"
on storage.objects for select
to authenticated
using (bucket_id = 'documentos' and public.is_wedding_member(((storage.foldername(name))[1])::uuid));

create policy "documentos_escrita_equipe"
on storage.objects for all
to authenticated
using (bucket_id = 'documentos' and public.can_edit_wedding(((storage.foldername(name))[1])::uuid))
with check (bucket_id = 'documentos' and public.can_edit_wedding(((storage.foldername(name))[1])::uuid));
