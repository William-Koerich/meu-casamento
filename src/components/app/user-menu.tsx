"use client"

import { useTransition } from "react"
import Link from "next/link"
import { LogOut, Repeat, UserRound } from "lucide-react"

import { sair } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu({ souCerimonialista }: { souCerimonialista?: boolean }) {
  const [pendente, iniciarTransicao] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <span className="sr-only">Menu da conta</span>
          <UserRound className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {souCerimonialista && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/casamentos">
                <Repeat className="size-4" />
                Trocar casamento
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          disabled={pendente}
          onClick={() => iniciarTransicao(() => sair())}
        >
          <LogOut className="size-4" />
          {pendente ? "Saindo..." : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
