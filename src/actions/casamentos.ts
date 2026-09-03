"use server"

import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { getMeuPerfil } from "@/db/queries/profiles"
import { onboardingConcluido } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { weddings } from "@/db/schema"
import {
  COOKIE_CASAMENTO_ATIVO,
  OPCOES_COOKIE_CASAMENTO_ATIVO,
} from "@/lib/casamento-ativo"
import { ehViolacaoDeSlugDuplicado, gerarSlugUnico } from "@/lib/slug"
import { createClient } from "@/lib/supabase/server"
import { nomesSchema } from "@/lib/validators/onboarding"

type ResultadoAction = { erro: string } | { erro?: undefined }

async function usuarioAtual() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/entrar")
  return user
}

async function definirCasamentoAtivo(id: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_CASAMENTO_ATIVO, id, OPCOES_COOKIE_CASAMENTO_ATIVO)
}

/**
 * Só conta cerimonialista cadastra mais de um casamento — a policy de RLS
 * (`weddings_insert_dona`) sozinha deixaria qualquer conta autenticada
 * inserir por `ownerId = auth.uid()`, então a checagem de tipo de conta é
 * só desta Server Action pra baixo, não do banco.
 */
export async function criarCasamento(input: unknown): Promise<ResultadoAction> {
  const dados = nomesSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os dois nomes." }

  const user = await usuarioAtual()
  const perfil = await getMeuPerfil()
  if (perfil?.tipoConta !== "cerimonialista") {
    return { erro: "Só contas de cerimonialista podem cadastrar mais de um casamento." }
  }

  // Sem .returning(): "weddings_select_membros" resolve via is_wedding_member(),
  // função security definer que faz sua própria busca em public.weddings — essa
  // busca interna não enxerga a linha que o próprio INSERT ainda está
  // inserindo (visibilidade por command counter do Postgres), então o check
  // implícito de SELECT que o RETURNING exige falha sempre com "new row
  // violates row-level security policy", mesmo o INSERT em si sendo permitido.
  // Gerando o id no servidor Node (em vez de "defaultRandom()" no banco) a
  // gente já sabe o id sem precisar reconsultar.
  const { rls } = await createDrizzleSupabaseClient()
  let novoId: string | null = null
  for (let tentativa = 0; tentativa < 3 && !novoId; tentativa++) {
    const idTentativa = crypto.randomUUID()
    try {
      await rls((tx) =>
        tx.insert(weddings).values({
          id: idTentativa,
          ownerId: user.id,
          nomeNoiva: dados.data.nomeNoiva,
          nomeNoivo: dados.data.nomeNoivo,
          slug: gerarSlugUnico(dados.data.nomeNoiva, dados.data.nomeNoivo),
        })
      )
      novoId = idTentativa
    } catch (erro) {
      if (!ehViolacaoDeSlugDuplicado(erro)) throw erro
    }
  }

  if (!novoId) return { erro: "Não foi possível criar. Tente novamente." }

  await definirCasamentoAtivo(novoId)
  // Nomes já preenchidos aqui — pula direto pro 2º passo do wizard.
  redirect("/inicio/data")
}

/** Troca o casamento ativo e entra nele (dashboard ou onboarding, conforme o progresso). */
export async function selecionarCasamento(id: string): Promise<never> {
  await usuarioAtual()

  const { rls } = await createDrizzleSupabaseClient()
  const wedding = await rls((tx) =>
    tx.query.weddings.findFirst({ where: eq(weddings.id, id) })
  )
  if (!wedding) redirect("/casamentos")

  await definirCasamentoAtivo(wedding.id)
  redirect(onboardingConcluido(wedding) ? "/app" : "/inicio")
}

export async function excluirCasamento(id: string): Promise<ResultadoAction> {
  const { rls } = await createDrizzleSupabaseClient()
  try {
    await rls((tx) => tx.delete(weddings).where(eq(weddings.id, id)))
  } catch {
    return { erro: "Não foi possível excluir esse casamento." }
  }

  // Se era o casamento ativo da sessão, some o cookie — senão getMinhaWedding
  // cairia num id que não existe mais até resolver o fallback.
  const cookieStore = await cookies()
  if (cookieStore.get(COOKIE_CASAMENTO_ATIVO)?.value === id) {
    cookieStore.delete(COOKIE_CASAMENTO_ATIVO)
  }

  revalidatePath("/casamentos")
  return {}
}
