-- Busca pública de convidado por nome, usada em /c/[slug]/confirmar. A RLS
-- de `guests` só libera leitura por código exato (request.guest_code) — não
-- há policy de busca por nome porque isso exigiria dar a `anon` visibilidade
-- de linha antes de ela apresentar qualquer prova de identidade. Em vez
-- disso, uma função security definer devolve só {id, nome, codigo_rsvp} de
-- casamentos publicados, e o fluxo de confirmação usa o código retornado
-- para seguir pela policy normal (ver src/db/schema/guests.ts).
create or replace function public.buscar_convidados_publico(p_wedding_id uuid, p_termo text)
returns table (id uuid, nome text, codigo_rsvp text)
language sql
security definer
set search_path = public
stable
as $$
  select g.id, g.nome, g.codigo_rsvp
  from public.guests g
  join public.weddings w on w.id = g.wedding_id
  where g.wedding_id = p_wedding_id
    and w.publicado = true
    and g.nome ilike '%' || p_termo || '%'
  order by g.nome
  limit 10;
$$;

grant execute on function public.buscar_convidados_publico(uuid, text) to anon, authenticated;
