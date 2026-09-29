import { eq, type Column } from "drizzle-orm"
import type { PgTable } from "drizzle-orm/pg-core"

import type { Transaction } from "@/db/rls"

/** Retorno padrão de toda `excluirX` que suporta desfazer — `linha` é o que
 * a Server Action de `restaurarX` correspondente precisa receber de volta. */
export type ResultadoExclusao<T> =
  { erro: string; linha?: undefined } | { erro?: undefined; linha: T }

/** Mesma ideia, para item removido de um array JSONB (lua de mel) — guarda
 * também a posição original, pra `restaurarX` reinserir no mesmo lugar em
 * vez de jogar no fim da lista. */
export type ResultadoExclusaoIndice<T> =
  | { erro: string; item?: undefined; indice?: undefined }
  | { erro?: undefined; item: T; indice: number }

/**
 * Exclui uma linha e devolve o que foi apagado — base do "desfazer"
 * (ver decisão "Lixeira/desfazer em exclusões" no CLAUDE.md). `.returning()`
 * é seguro aqui porque as tabelas usadas são todas filhas comuns de
 * `weddings`, cuja policy de SELECT (`is_wedding_member`) não reconsulta a
 * própria tabela — não é o caso de `weddings`/`guest_photos`, documentado
 * como pegadinha de RLS+RETURNING nas Fases 11/12; nunca usar esta função
 * nelas.
 *
 * Cascatas de FK (ex.: excluir um item de orçamento apaga os pagamentos
 * ligados via `onDelete: "cascade"") não são desfeitas — só a linha
 * excluída diretamente volta. O diálogo de confirmação de cada tela já
 * avisa quando isso se aplica.
 */
export async function excluirComRetorno<T extends PgTable>(
  tx: Transaction,
  tabela: T,
  coluna: Column,
  id: string
): Promise<T["$inferSelect"] | null> {
  const [linha] = await tx.delete(tabela).where(eq(coluna, id)).returning()
  return (linha as T["$inferSelect"]) ?? null
}

/** Reinsere exatamente a linha capturada por `excluirComRetorno` (mesmo id). */
export async function restaurarLinha<T extends PgTable>(
  tx: Transaction,
  tabela: T,
  dados: T["$inferInsert"]
): Promise<void> {
  await tx.insert(tabela).values(dados)
}
