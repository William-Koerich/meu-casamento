import { redirect } from "next/navigation"

import { getMeuPerfil } from "@/db/queries/profiles"
import { getMinhaWedding, onboardingConcluido } from "@/db/queries/weddings"
import { NOME_PRODUTO } from "@/lib/site"

// Fora de "/app" de propósito, igual "/inicio" — só que este é o ponto de
// entrada de conta cerimonialista (vários casamentos), não de conta noiva
// (1 casamento, sempre cai em "/inicio" quando falta cadastrar).
export default async function CasamentosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const perfil = await getMeuPerfil()
  if (perfil?.tipoConta !== "cerimonialista") {
    const wedding = await getMinhaWedding()
    redirect(onboardingConcluido(wedding) ? "/app" : "/inicio")
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center px-6 py-12">
      <p className="font-heading mb-10 text-xl">{NOME_PRODUTO}</p>
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  )
}
