import Link from "next/link"

import { SidebarNav } from "@/components/app/sidebar-nav"
import { NOME_PRODUTO } from "@/lib/site"

export function Sidebar() {
  return (
    <aside className="border-border bg-sidebar hidden w-60 shrink-0 flex-col overflow-y-auto border-r px-4 py-6 md:flex">
      <Link href="/app" className="font-heading mb-6 block px-3 text-lg">
        {NOME_PRODUTO}
      </Link>
      <SidebarNav />
    </aside>
  )
}
