// Lido pelos 3 clients Supabase (browser, server, middleware) — centralizado
// aqui para trocar um `!` de non-null assertion por um erro explícito. Sem
// isso, faltando a variável em produção, o erro que aparece é o interno do
// @supabase/ssr/createServerClient tentando montar uma URL a partir de
// `undefined` (ex.: no middleware, que roda em toda rota, derrubando o site
// inteiro com "MIDDLEWARE_INVOCATION_FAILED" sem dizer qual variável falta).
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY não estão definidas. " +
        "Confira as variáveis de ambiente do projeto (na Vercel: Settings > Environment " +
        "Variables, aplicadas ao ambiente correto — Production/Preview/Development)."
    )
  }

  return { url, anonKey }
}
