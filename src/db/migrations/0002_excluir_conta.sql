-- Autoexclusão de conta sem service key: a função roda como o dono das
-- tabelas (security definer), única forma de apagar de auth.users com a
-- role authenticated. O cascade em profiles/weddings/wedding_members (FKs
-- ON DELETE CASCADE definidas na Fase 2) cuida do resto: se quem exclui é
-- dona de um casamento, todos os dados desse casamento somem junto; se é só
-- membro, some apenas a própria conta e a própria linha de wedding_members.
create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.excluir_minha_conta() to authenticated;
