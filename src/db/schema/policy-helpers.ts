import { sql, type SQL } from "drizzle-orm"
import { pgPolicy, type PgColumn } from "drizzle-orm/pg-core"

import { authenticatedRole } from "@/db/schema/auth"

// Fragmentos de policy reaproveitados pelas tabelas "filhas" de weddings.
// As funções `public.is_wedding_member` / `public.can_edit_wedding` /
// `public.is_wedding_admin` são criadas na migration custom (0001_rls_setup)
// como `security definer` para evitar recursão de RLS entre weddings e
// wedding_members. Ver CLAUDE.md > "Acesso a dados" para o racional.

export function isWeddingMember(weddingId: PgColumn): SQL {
  return sql`(select public.is_wedding_member(${weddingId}))`
}

export function canEditWedding(weddingId: PgColumn): SQL {
  return sql`(select public.can_edit_wedding(${weddingId}))`
}

export function isWeddingAdmin(weddingId: PgColumn): SQL {
  return sql`(select public.is_wedding_admin(${weddingId}))`
}

/**
 * Conjunto padrão de 4 policies (select/insert/update/delete) para tabelas
 * "filhas" de weddings: leitura para quem faz parte do casamento (dona,
 * membro aceito de qualquer permissão), escrita para quem não é `leitor`.
 */
export function standardWeddingPolicies(namePrefix: string, weddingId: PgColumn) {
  return [
    pgPolicy(`${namePrefix}_select`, {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: isWeddingMember(weddingId),
    }),
    pgPolicy(`${namePrefix}_insert`, {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: canEditWedding(weddingId),
    }),
    pgPolicy(`${namePrefix}_update`, {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: canEditWedding(weddingId),
      withCheck: canEditWedding(weddingId),
    }),
    pgPolicy(`${namePrefix}_delete`, {
      as: "permissive",
      for: "delete",
      to: authenticatedRole,
      using: canEditWedding(weddingId),
    }),
  ]
}
