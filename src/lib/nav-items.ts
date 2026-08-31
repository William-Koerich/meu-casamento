import type { LucideIcon } from "lucide-react"
import {
  CalendarClock,
  FileText,
  Gift,
  Grid3x3,
  Home,
  Image,
  ListChecks,
  Music,
  Plane,
  Settings,
  ShoppingBag,
  Store,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react"

export type NavItem = {
  rotulo: string
  href: string
  icone: LucideIcon
}

// Fonte única da navegação da área logada — usada pela sidebar (desktop) e
// pelo menu mobile (bottom nav + drawer).
export const NAV_ITEMS: NavItem[] = [
  { rotulo: "Início", href: "/app", icone: Home },
  { rotulo: "Checklist", href: "/app/checklist", icone: ListChecks },
  { rotulo: "Orçamento", href: "/app/orcamento", icone: Wallet },
  { rotulo: "Fornecedores", href: "/app/fornecedores", icone: Store },
  { rotulo: "Convidados", href: "/app/convidados", icone: Users },
  { rotulo: "Mesas", href: "/app/convidados/mesas", icone: Grid3x3 },
  { rotulo: "Cronograma", href: "/app/cronograma", icone: CalendarClock },
  { rotulo: "Inspirações", href: "/app/inspiracoes", icone: Image },
  { rotulo: "Playlist", href: "/app/playlist", icone: Music },
  { rotulo: "Presentes", href: "/app/presentes", icone: Gift },
  { rotulo: "Enxoval", href: "/app/enxoval", icone: ShoppingBag },
  { rotulo: "Lua de mel", href: "/app/lua-de-mel", icone: Plane },
  { rotulo: "Documentos", href: "/app/documentos", icone: FileText },
  { rotulo: "Equipe", href: "/app/equipe", icone: UserPlus },
  { rotulo: "Configurações", href: "/app/configuracoes", icone: Settings },
]

// Itens de maior uso diário, mostrados direto na barra inferior no mobile —
// o resto vive no drawer "Mais".
export const NAV_ITEMS_MOBILE_PRINCIPAIS = [
  "/app",
  "/app/checklist",
  "/app/orcamento",
  "/app/convidados",
]
