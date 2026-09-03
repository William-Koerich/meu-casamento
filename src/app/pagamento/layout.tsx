import { redirect } from "next/navigation"

import { getMeuPerfil } from "@/db/queries/profiles"
import { getMinhaWedding, onboardingConcluido } from "@/db/queries/weddings"
import { NOME_PRODUTO } from "@/lib/site"

// Fora de "/app" de propósito, mesmo padrão de "/inicio" e "/casamentos" —
// só que este é o gate de pagamento único da noiva (Fase 14), alcançável só
// depois do onboarding completo e só enquanto o casamento não estiver pago.
export default async function PagamentoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [wedding, perfil] = await Promise.all([getMinhaWedding(), getMeuPerfil()])

  if (perfil?.tipoConta === "cerimonialista") redirect("/casamentos")
  if (!wedding || !onboardingConcluido(wedding)) redirect("/inicio")
  if (wedding.pago) redirect("/app")

  return (
    <div className="bg-background flex min-h-screen flex-col items-center px-6 py-12">
      <p className="font-heading mb-10 text-xl">{NOME_PRODUTO}</p>
      <div className="w-full max-w-lg text-center">{children}</div>
    </div>
  )
}
