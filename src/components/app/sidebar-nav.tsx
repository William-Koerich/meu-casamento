"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { itemNavAtivo, NAV_ITEMS } from "@/lib/nav-items"
import { cn } from "@/lib/utils"

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const ativo = itemNavAtivo(pathname, item)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors",
              ativo
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <item.icone className="size-4 shrink-0" />
            {item.rotulo}
          </Link>
        )
      })}
    </nav>
  )
}
