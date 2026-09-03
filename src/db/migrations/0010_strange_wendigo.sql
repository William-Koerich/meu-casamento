ALTER TABLE "profiles" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint

-- default "true" na criação da coluna grandfatheia todo casamento que já
-- existia (inclusive o de produção) como pago — ninguém que já usa o app
-- fica bloqueado quando o gate de pagamento entrar em vigor. Só depois o
-- default muda pra "false", valendo pra casamento novo daqui pra frente.
ALTER TABLE "weddings" ADD COLUMN "pago" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "weddings" ALTER COLUMN "pago" SET DEFAULT false;--> statement-breakpoint

-- -----------------------------------------------------------------------------
-- Hardening de coluna (Fase 14 — pagamentos via Stripe): sem isso, qualquer
-- conta autenticada poderia chamar a REST API do Supabase diretamente (fora
-- do código deste app) e se autoconceder pagamento/plano de graça, porque a
-- policy de RLS de UPDATE dessas tabelas autoriza a linha inteira, sem
-- filtro de coluna (só "anon" tinha esse tipo de revoke, na migration
-- 0001 — "authenticated" nunca precisou até existir uma coluna que preço
-- de verdade controla). "pago" e as 3 colunas de plano/billing só podem
-- mudar pelo client administrativo (webhook do Stripe, bypassa RLS por ser
-- table owner), nunca pela role "authenticated".
-- -----------------------------------------------------------------------------

revoke update ("pago") on public.weddings from authenticated;
revoke update ("tipo_conta", "plano_cerimonialista", "stripe_customer_id") on public.profiles from authenticated;--> statement-breakpoint

-- -----------------------------------------------------------------------------
-- handle_new_user() (migrations 0001/0008) parava de dar plano "basico" de
-- graça pra toda conta cerimonialista nova — agora que existe cobrança de
-- verdade, ela nasce sem plano (null) e só ganha um quando o webhook do
-- Stripe confirmar a primeira assinatura (checkout.session.completed).
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