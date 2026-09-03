"use server"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { addDays, format, subMonths } from "date-fns"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createDrizzleSupabaseClient } from "@/db/rls"
import { budgetCategories, tasks, weddings } from "@/db/schema"
import { CHECKLIST_TEMPLATE } from "@/lib/checklist-template"
import { ORCAMENTO_TEMPLATE } from "@/lib/orcamento-template"
import { ehViolacaoDeSlugDuplicado, gerarSlugUnico } from "@/lib/slug"
import { createClient } from "@/lib/supabase/server"
import {
  convidadosSchema,
  dataLocalSchema,
  estiloSchema,
  nomesSchema,
  orcamentoSchema,
} from "@/lib/validators/onboarding"

type ResultadoAction = { erro: string } | { erro?: undefined }

async function usuarioAtual() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/entrar")
  return user
}

export async function salvarNomes(input: unknown): Promise<ResultadoAction> {
  const dados = nomesSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os dois nomes." }

  const user = await usuarioAtual()
  const { rls } = await createDrizzleSupabaseClient()

  // Casamento "ativo" da sessão, não só "o primeiro que essa conta tem" —
  // uma conta cerimonialista pode ter outros casamentos já concluídos, e
  // as etapas seguintes do wizard precisam mexer sempre no mesmo rascunho
  // (ver getMinhaWedding, que resolve pelo cookie casamento_ativo).
  const rascunho = await getMinhaWedding()

  if (rascunho) {
    await rls((tx) =>
      tx
        .update(weddings)
        .set({ nomeNoiva: dados.data.nomeNoiva, nomeNoivo: dados.data.nomeNoivo })
        .where(eq(weddings.id, rascunho.id))
    )
    redirect("/inicio/data")
  }

  let criado = false
  for (let tentativa = 0; tentativa < 3 && !criado; tentativa++) {
    try {
      await rls((tx) =>
        tx.insert(weddings).values({
          ownerId: user.id,
          nomeNoiva: dados.data.nomeNoiva,
          nomeNoivo: dados.data.nomeNoivo,
          slug: gerarSlugUnico(dados.data.nomeNoiva, dados.data.nomeNoivo),
        })
      )
      criado = true
    } catch (erro) {
      if (!ehViolacaoDeSlugDuplicado(erro)) throw erro
    }
  }

  if (!criado) {
    return { erro: "Não foi possível salvar. Tente novamente." }
  }

  redirect("/inicio/data")
}

export async function salvarDataLocal(input: unknown): Promise<ResultadoAction> {
  const dados = dataLocalSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha data, cidade e estado." }

  await usuarioAtual()
  const wedding = await getMinhaWedding()
  if (!wedding) redirect("/inicio/nomes")

  const { rls } = await createDrizzleSupabaseClient()
  await rls((tx) =>
    tx
      .update(weddings)
      .set({
        dataCasamento: dados.data.dataCasamento,
        cidade: dados.data.cidade,
        estado: dados.data.estado,
      })
      .where(eq(weddings.id, wedding.id))
  )

  redirect("/inicio/convidados")
}

export async function salvarConvidados(input: unknown): Promise<ResultadoAction> {
  const dados = convidadosSchema.safeParse(input)
  if (!dados.success) return { erro: "Informe o número estimado de convidados." }

  await usuarioAtual()
  const wedding = await getMinhaWedding()
  if (!wedding) redirect("/inicio/nomes")

  const { rls } = await createDrizzleSupabaseClient()
  await rls((tx) =>
    tx
      .update(weddings)
      .set({ convidadosEstimados: dados.data.convidadosEstimados })
      .where(eq(weddings.id, wedding.id))
  )

  redirect("/inicio/orcamento")
}

export async function salvarOrcamento(input: unknown): Promise<ResultadoAction> {
  const dados = orcamentoSchema.safeParse(input)
  if (!dados.success) return { erro: "Informe o orçamento total." }

  await usuarioAtual()
  const wedding = await getMinhaWedding()
  if (!wedding) redirect("/inicio/nomes")

  const { rls } = await createDrizzleSupabaseClient()
  await rls((tx) =>
    tx
      .update(weddings)
      .set({ orcamentoTotal: String(dados.data.orcamentoTotal) })
      .where(eq(weddings.id, wedding.id))
  )

  redirect("/inicio/estilo")
}

function calcularPrazoTarefa(dataCasamento: Date, mesesAntes: number) {
  const prazo =
    mesesAntes === 0 ? addDays(dataCasamento, -7) : subMonths(dataCasamento, mesesAntes)
  return format(prazo, "yyyy-MM-dd")
}

export async function finalizarOnboarding(input: unknown): Promise<ResultadoAction> {
  const dados = estiloSchema.safeParse(input)
  if (!dados.success) return { erro: "Escolha um estilo para continuar." }

  await usuarioAtual()
  const wedding = await getMinhaWedding()

  if (!wedding || !wedding.dataCasamento || !wedding.orcamentoTotal) {
    redirect("/inicio")
  }

  const { rls } = await createDrizzleSupabaseClient()
  await rls(async (tx) => {
    await tx
      .update(weddings)
      .set({ estilo: dados.data.estilo })
      .where(eq(weddings.id, wedding.id))

    await tx.insert(budgetCategories).values(
      ORCAMENTO_TEMPLATE.map(({ nome, percentual, cor }, ordem) => ({
        weddingId: wedding.id,
        nome,
        valorPrevisto: String((Number(wedding.orcamentoTotal) * percentual) / 100),
        cor,
        ordem,
      }))
    )

    const dataCasamento = new Date(wedding.dataCasamento!)
    await tx.insert(tasks).values(
      CHECKLIST_TEMPLATE.map((item, ordem) => ({
        weddingId: wedding.id,
        titulo: item.titulo,
        categoria: item.categoria,
        mesesAntes: item.mesesAntes,
        prazo: calcularPrazoTarefa(dataCasamento, item.mesesAntes),
        ordem,
        origem: "template" as const,
      }))
    )
  })

  redirect("/app")
}
