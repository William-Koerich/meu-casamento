import { redirect } from "next/navigation"

import { getMinhaWedding, onboardingConcluido } from "@/db/queries/weddings"
import { NOME_PRODUTO } from "@/lib/site"

export default async function InicioLayout({ children }: { children: React.ReactNode }) {
  const wedding = await getMinhaWedding()
  if (onboardingConcluido(wedding)) redirect("/app")

  return (
    <div className="bg-background flex min-h-screen flex-col items-center px-6 py-12">
      <p className="font-heading mb-10 text-xl">{NOME_PRODUTO}</p>
      <div className="w-full max-w-lg">{children}</div>
    </div>
  )
}
