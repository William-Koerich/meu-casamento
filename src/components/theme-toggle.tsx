"use client"

import { Check, Monitor, Moon, Sun } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Tema } from "@/lib/theme"

const OPCOES: { tema: Tema; rotulo: string; icone: typeof Sun }[] = [
  { tema: "claro", rotulo: "Claro", icone: Sun },
  { tema: "escuro", rotulo: "Escuro", icone: Moon },
  { tema: "sistema", rotulo: "Sistema", icone: Monitor },
]

export function ThemeToggle() {
  const { tema, definirTema } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <span className="sr-only">Alternar tema</span>
          <Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPCOES.map((opcao) => (
          <DropdownMenuItem key={opcao.tema} onClick={() => definirTema(opcao.tema)}>
            <opcao.icone className="size-4" />
            {opcao.rotulo}
            {tema === opcao.tema && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
