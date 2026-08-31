import { redirect } from "next/navigation"

import { AppHeader } from "@/components/app/app-header"
import { BottomNav } from "@/components/app/bottom-nav"
import { Sidebar } from "@/components/app/sidebar"
import { getMinhaWedding, onboardingConcluido } from "@/db/queries/weddings"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const wedding = await getMinhaWedding()
  if (!wedding || !onboardingConcluido(wedding)) redirect("/inicio")

  return (
    <div className="bg-background flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          nomeNoiva={wedding.nomeNoiva}
          nomeNoivo={wedding.nomeNoivo}
          dataCasamento={wedding.dataCasamento}
        />
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}
