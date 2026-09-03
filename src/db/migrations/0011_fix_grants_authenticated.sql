-- -----------------------------------------------------------------------------
-- Corrige o hardening de coluna da migration 0010: "revoke update (col) on
-- table from authenticated" não teve efeito nenhum porque "authenticated"
-- tinha (e ainda tem) UPDATE concedido a nível de TABELA inteira — no
-- modelo de ACL do Postgres, revogar uma coluna específica só remove algo
-- que tivesse sido concedido naquele mesmo nível de coluna; não recorta uma
-- exceção de um grant mais amplo já existente na tabela. Confirmado
-- consultando information_schema.column_privileges depois de aplicar a
-- 0010: "pago", "tipo_conta", "plano_cerimonialista" e "stripe_customer_id"
-- continuavam com UPDATE liberado pra authenticated.
--
-- Fix, no mesmo padrão já usado pra "anon" na migration 0001: revoga o
-- UPDATE de tabela inteira e concede de volta só nas colunas que a
-- aplicação de fato edita — dessa vez em "authenticated", não em "anon".
-- (Revoga só UPDATE, não "all", pra não mexer em SELECT/INSERT/DELETE que
-- já funcionam via RLS.)
-- -----------------------------------------------------------------------------

revoke update on public.weddings from authenticated;
grant update (
  nome_noiva, nome_noivo, data_casamento, hora_cerimonia, local_cerimonia,
  endereco_cerimonia, local_festa, endereco_festa, cidade, estado,
  orcamento_total, convidados_estimados, estilo, historia_casal,
  foto_capa_url, foto_capa_posicao_x, foto_capa_posicao_y, foto_capa_zoom,
  dress_code, slug, publicado, updated_at
) on public.weddings to authenticated;
-- De brinde: "owner_id" também fica de fora da lista acima (nunca esteve
-- em nenhum formulário/action da aplicação) — fecha de vez uma brecha que
-- já existia antes desta fase (um membro "admin" via wedding_members,
-- sem ser a dona, podia em tese tentar transferir a propriedade pra si
-- mesmo com um update direto; a policy de RLS não filtrava essa coluna).

revoke update on public.profiles from authenticated;
grant update (nome, avatar_url, telefone) on public.profiles to authenticated;
