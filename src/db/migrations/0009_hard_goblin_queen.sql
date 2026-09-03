CREATE TYPE "public"."plano_cerimonialista" AS ENUM('basico', 'premium', 'platinum');--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "plano_cerimonialista" "plano_cerimonialista";--> statement-breakpoint

-- -----------------------------------------------------------------------------
-- handle_new_user() (migration 0001, já atualizada na 0008 pra gravar
-- tipo_conta) passa a também gravar o plano inicial de conta cerimonialista:
-- toda cerimonialista nasce no plano "basico" (upgrade é manual por enquanto,
-- ver Fase 13 no CLAUDE.md — sem cobrança de verdade ainda). Conta noiva
-- continua com plano_cerimonialista null (não se aplica).
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tipo_conta text := coalesce(new.raw_user_meta_data ->> 'tipo_conta', 'noiva');
begin
  insert into public.profiles (id, nome, tipo_conta, plano_cerimonialista)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    v_tipo_conta::tipo_conta,
    case when v_tipo_conta = 'cerimonialista' then 'basico'::plano_cerimonialista else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;