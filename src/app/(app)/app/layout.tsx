import { redirect } from "next/navigation"

import { AppHeader } from "@/components/app/app-header"
import { BottomNav } from "@/components/app/bottom-nav"
import { Sidebar } from "@/components/app/sidebar"
import { getMeuPerfil } from "@/db/queries/profiles"
import { getMinhaWedding, onboardingConcluido } from "@/db/queries/weddings"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [wedding, perfil] = await Promise.all([getMinhaWedding(), getMeuPerfil()])
  const souCerimonialista = perfil?.tipoConta === "cerimonialista"

  if (!wedding || !onboardingConcluido(wedding)) {
    // Conta noiva sem casamento cadastrado cai no wizard de onboarding;
    // conta cerimonialista cai no painel de casamentos (ela cadastra o dela
    // mesma, e pode ter outros já concluídos — não faz sentido "um wizard
    // só" pra uma conta que gerencia vários).
    redirect(souCerimonialista ? "/casamentos" : "/inicio")
  }

  // Gate de pagamento (Fase 14): só depois do wizard inteiro, não antes — a
  // noiva já viu o produto pronto com os dados dela antes de decidir pagar.
  // Não se aplica a casamento de conta cerimonialista (coberto pela
  // assinatura dela, ver weddings.pago em criarCasamento).
  if (!souCerimonialista && !wedding.pago) {
    redirect("/pagamento")
  }

  return (
    <div className="bg-background flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          nomeNoiva={wedding.nomeNoiva}
          nomeNoivo={wedding.nomeNoivo}
          dataCasamento={wedding.dataCasamento}
          souCerimonialista={souCerimonialista}
        />
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}
