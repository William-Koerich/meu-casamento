import { redirect } from "next/navigation"

import { getMeuPerfil } from "@/db/queries/profiles"
import { getMinhaWedding, onboardingConcluido } from "@/db/queries/weddings"
import { NOME_PRODUTO } from "@/lib/site"

// Fora de "/app", mesmo padrão de "/casamentos" — painel de assinatura só
// pra conta cerimonialista, tanto pra assinar o primeiro plano quanto pra
// gerenciar/trocar depois (portal do Stripe).
export default async function PlanosLayout({ children }: { children: React.ReactNode }) {
  const perfil = await getMeuPerfil()
  if (perfil?.tipoConta !== "cerimonialista") {
    const wedding = await getMinhaWedding()
    redirect(onboardingConcluido(wedding) ? "/app" : "/inicio")
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center px-6 py-12">
      <p className="font-heading mb-10 text-xl">{NOME_PRODUTO}</p>
      <div className="w-full max-w-4xl">{children}</div>
    </div>
  )
}
