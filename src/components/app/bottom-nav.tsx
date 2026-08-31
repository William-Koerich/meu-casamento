"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NAV_ITEMS, NAV_ITEMS_MOBILE_PRINCIPAIS } from "@/lib/nav-items"
import { cn } from "@/lib/utils"

function estaAtivo(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href)
}

export function BottomNav() {
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)

  const principais = NAV_ITEMS.filter((item) =>
    NAV_ITEMS_MOBILE_PRINCIPAIS.includes(item.href)
  )

  return (
    <nav className="border-border bg-background fixed inset-x-0 bottom-0 z-40 flex border-t md:hidden print:hidden">
      {principais.map((item) => {
        const ativo = estaAtivo(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[11px]",
              ativo ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icone className="size-5" />
            {item.rotulo}
          </Link>
        )
      })}
      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground flex flex-1 flex-col items-center gap-1 py-2 text-[11px]"
          >
            <Menu className="size-5" />
            Mais
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Navegação</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3 p-4 pt-0">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setAberto(false)}
                className={cn(
                  "border-border flex flex-col items-center gap-2 rounded border p-3 text-center text-xs",
                  estaAtivo(pathname, item.href) && "border-primary bg-accent"
                )}
              >
                <item.icone className="size-5" />
                {item.rotulo}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
