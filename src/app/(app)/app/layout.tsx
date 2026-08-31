import { redirect } from "next/navigation"

import { sair } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { getMinhaWedding, onboardingConcluido } from "@/db/queries/weddings"
import { NOME_PRODUTO } from "@/lib/site"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const wedding = await getMinhaWedding()
  if (!onboardingConcluido(wedding)) redirect("/inicio")

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border flex items-center justify-between border-b px-6 py-4">
        <p className="font-heading text-lg">{NOME_PRODUTO}</p>
        <form action={sair}>
          <Button type="submit" variant="ghost" size="sm">
            Sair
          </Button>
        </form>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  )
}
