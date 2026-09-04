import Link from "next/link"

import { Button } from "@/components/ui/button"
import { NOME_PRODUTO } from "@/lib/site"

const NAV = [
  { rotulo: "Preços", href: "/precos" },
  { rotulo: "Para cerimonialistas", href: "/para-cerimonialistas" },
]

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border bg-background/95 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            {/* Aliança — mesmo desenho do favicon (icon.tsx), círculos
                aninhados em vez de ícone importado. */}
            <span className="bg-primary flex size-7 shrink-0 items-center justify-center rounded-full">
              <span className="bg-primary-foreground flex size-4 items-center justify-center rounded-full">
                <span className="bg-primary size-2 rounded-full" />
              </span>
            </span>
            <span className="font-heading text-lg">{NOME_PRODUTO}</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.rotulo}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/entrar">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/cadastro">Começar agora</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-border border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm sm:flex-row">
          <p>
            © {new Date().getFullYear()} {NOME_PRODUTO}
          </p>
          <div className="flex gap-6">
            <Link href="/precos" className="hover:text-foreground transition-colors">
              Preços
            </Link>
            <Link
              href="/para-cerimonialistas"
              className="hover:text-foreground transition-colors"
            >
              Para cerimonialistas
            </Link>
            <Link href="/privacidade" className="hover:text-foreground transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-foreground transition-colors">
              Termos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
