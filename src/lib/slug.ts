import { gerarCodigo, slugify } from "@/lib/utils"

// Compartilhado entre o onboarding (1º casamento de uma conta) e a criação
// de novos casamentos por uma conta cerimonialista (Fase 12) — mesmo padrão
// de retry em colisão nos dois lugares.
export function gerarSlugUnico(nomeNoiva: string, nomeNoivo: string) {
  const base = slugify(`${nomeNoiva} e ${nomeNoivo}`) || "casamento"
  return `${base}-${gerarCodigo(4).toLowerCase()}`
}

export function ehViolacaoDeSlugDuplicado(erro: unknown) {
  return Boolean(
    erro && typeof erro === "object" && "code" in erro && erro.code === "23505"
  )
}
