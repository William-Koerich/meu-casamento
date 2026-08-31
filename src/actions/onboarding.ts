"use server"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { addDays, format, subMonths } from "date-fns"

import { createDrizzleSupabaseClient } from "@/db/rls"
import { budgetCategories, tasks, weddings } from "@/db/schema"
import { CHECKLIST_TEMPLATE } from "@/lib/checklist-template"
import { ORCAMENTO_TEMPLATE } from "@/lib/orcamento-template"
import { createClient } from "@/lib/supabase/server"
import { gerarCodigo, slugify } from "@/lib/utils"
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

function gerarSlugUnico(nomeNoiva: string, nomeNoivo: string) {
  const base = slugify(`${nomeNoiva} e ${nomeNoivo}`) || "casamento"
  return `${base}-${gerarCodigo(4).toLowerCase()}`
}

function ehViolacaoDeSlugDuplicado(erro: unknown) {
  return Boolean(
    erro && typeof erro === "object" && "code" in erro && erro.code === "23505"
  )
}

export async function salvarNomes(input: unknown): Promise<ResultadoAction> {
  const dados = nomesSchema.safeParse(input)
  if (!dados.success) return { erro: "Preencha os dois nomes." }

  const user = await usuarioAtual()
  const { rls } = await createDrizzleSupabaseClient()

  const rascunho = await rls((tx) =>
    tx.query.weddings.findFirst({ where: eq(weddings.ownerId, user.id) })
  )

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

  const user = await usuarioAtual()
  const { rls } = await createDrizzleSupabaseClient()

  await rls((tx) =>
    tx
      .update(weddings)
      .set({
        dataCasamento: dados.data.dataCasamento,
        cidade: dados.data.cidade,
        estado: dados.data.estado,
      })
      .where(eq(weddings.ownerId, user.id))
  )

  redirect("/inicio/convidados")
}

export async function salvarConvidados(input: unknown): Promise<ResultadoAction> {
  const dados = convidadosSchema.safeParse(input)
  if (!dados.success) return { erro: "Informe o número estimado de convidados." }

  const user = await usuarioAtual()
  const { rls } = await createDrizzleSupabaseClient()

  await rls((tx) =>
    tx
      .update(weddings)
      .set({ convidadosEstimados: dados.data.convidadosEstimados })
      .where(eq(weddings.ownerId, user.id))
  )

  redirect("/inicio/orcamento")
}

export async function salvarOrcamento(input: unknown): Promise<ResultadoAction> {
  const dados = orcamentoSchema.safeParse(input)
  if (!dados.success) return { erro: "Informe o orçamento total." }

  const user = await usuarioAtual()
  const { rls } = await createDrizzleSupabaseClient()

  await rls((tx) =>
    tx
      .update(weddings)
      .set({ orcamentoTotal: String(dados.data.orcamentoTotal) })
      .where(eq(weddings.ownerId, user.id))
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

  const user = await usuarioAtual()
  const { rls } = await createDrizzleSupabaseClient()

  const wedding = await rls((tx) =>
    tx.query.weddings.findFirst({ where: eq(weddings.ownerId, user.id) })
  )

  if (!wedding || !wedding.dataCasamento || !wedding.orcamentoTotal) {
    redirect("/inicio")
  }

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
