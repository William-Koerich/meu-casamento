"use server"

import { redirect } from "next/navigation"

import {
  cadastroSchema,
  entrarSchema,
  recuperarSenhaSchema,
  redefinirSenhaSchema,
} from "@/lib/validators/auth"
import { createClient } from "@/lib/supabase/server"

type ResultadoAction = { erro: string } | { erro?: undefined; sucesso: true }

// Só aceita caminho relativo (evita open redirect via URL absoluta).
function destinoSeguro(redirecionarPara: string | undefined, padrao: string) {
  if (
    redirecionarPara &&
    redirecionarPara.startsWith("/") &&
    !redirecionarPara.startsWith("//")
  ) {
    return redirecionarPara
  }
  return padrao
}

export async function entrar(
  input: unknown,
  redirecionarPara?: string
): Promise<ResultadoAction> {
  const dados = entrarSchema.safeParse(input)
  if (!dados.success) {
    return { erro: "Dados inválidos." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: dados.data.email,
    password: dados.data.senha,
  })

  if (error) {
    return { erro: "E-mail ou senha incorretos." }
  }

  redirect(destinoSeguro(redirecionarPara, "/app"))
}

export async function cadastrar(
  input: unknown,
  redirecionarPara?: string
): Promise<ResultadoAction & { precisaConfirmarEmail?: boolean }> {
  const dados = cadastroSchema.safeParse(input)
  if (!dados.success) {
    return { erro: "Dados inválidos." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: dados.data.email,
    password: dados.data.senha,
    options: {
      data: { nome: dados.data.nome },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { erro: "Já existe uma conta com este e-mail." }
    }
    return { erro: "Não foi possível criar sua conta. Tente novamente." }
  }

  if (!data.session) {
    return { sucesso: true, precisaConfirmarEmail: true }
  }

  redirect(destinoSeguro(redirecionarPara, "/inicio"))
}

export async function recuperarSenha(input: unknown): Promise<ResultadoAction> {
  const dados = recuperarSenhaSchema.safeParse(input)
  if (!dados.success) {
    return { erro: "Dados inválidos." }
  }

  const supabase = await createClient()
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  await supabase.auth.resetPasswordForEmail(dados.data.email, {
    redirectTo: `${url}/auth/callback?next=/redefinir-senha`,
  })

  // Sempre retorna sucesso, mesmo se o e-mail não existir, para não revelar
  // quais e-mails têm conta cadastrada.
  return { sucesso: true }
}

export async function redefinirSenha(input: unknown): Promise<ResultadoAction> {
  const dados = redefinirSenhaSchema.safeParse(input)
  if (!dados.success) {
    return { erro: "Dados inválidos." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: dados.data.senha })

  if (error) {
    return { erro: "Não foi possível redefinir a senha. Solicite um novo link." }
  }

  redirect("/entrar")
}

export async function sair() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/entrar")
}
