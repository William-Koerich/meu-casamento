import { UserMenu } from "@/components/app/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { diasParaCasamento, textoContagemCompacta } from "@/lib/countdown"

type AppHeaderProps = {
  nomeNoiva: string
  nomeNoivo: string
  dataCasamento: string | null
}

export function AppHeader({ nomeNoiva, nomeNoivo, dataCasamento }: AppHeaderProps) {
  const dias = diasParaCasamento(dataCasamento)

  return (
    <header className="border-border bg-background sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 md:px-8 print:hidden">
      <div>
        <p className="font-heading text-base md:text-lg">
          {nomeNoiva} & {nomeNoivo}
        </p>
        <p className="text-muted-foreground text-xs">{textoContagemCompacta(dias)}</p>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
