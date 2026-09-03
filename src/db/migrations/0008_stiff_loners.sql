CREATE TYPE "public"."tipo_conta" AS ENUM('noiva', 'cerimonialista');--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "tipo_conta" "tipo_conta" DEFAULT 'noiva' NOT NULL;--> statement-breakpoint

-- -----------------------------------------------------------------------------
-- handle_new_user() (migration 0001) precisa gravar o tipo de conta escolhido
-- no cadastro (metadata "tipo_conta" do Supabase Auth) — coalesce pro valor
-- padrão "noiva" cobre cadastro via Google (sem essa metadata) e contas
-- antigas que já passaram pelo trigger antes desta coluna existir.
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, tipo_conta)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'tipo_conta', 'noiva')::tipo_conta
  )
  on conflict (id) do nothing;
  return new;
end;
$$;