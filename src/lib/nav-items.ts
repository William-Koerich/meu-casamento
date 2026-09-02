import type { LucideIcon } from "lucide-react"
import {
  CalendarClock,
  Camera,
  Download,
  FileText,
  Gift,
  Grid3x3,
  Home,
  Image,
  LayoutTemplate,
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
  { rotulo: "Fotos dos convidados", href: "/app/fotos-convidados", icone: Camera },
  { rotulo: "Playlist", href: "/app/playlist", icone: Music },
  { rotulo: "Presentes", href: "/app/presentes", icone: Gift },
  { rotulo: "Enxoval", href: "/app/enxoval", icone: ShoppingBag },
  { rotulo: "Lua de mel", href: "/app/lua-de-mel", icone: Plane },
  { rotulo: "Documentos", href: "/app/documentos", icone: FileText },
  { rotulo: "Equipe", href: "/app/equipe", icone: UserPlus },
  { rotulo: "Página pública", href: "/app/site-publico", icone: LayoutTemplate },
  { rotulo: "Configurações", href: "/app/configuracoes", icone: Settings },
  { rotulo: "Exportar", href: "/app/exportar", icone: Download },
]

// Itens de maior uso diário, mostrados direto na barra inferior no mobile —
// o resto vive no drawer "Mais".
export const NAV_ITEMS_MOBILE_PRINCIPAIS = [
  "/app",
  "/app/checklist",
  "/app/orcamento",
  "/app/convidados",
]

/**
 * Um item só fica marcado como ativo se nenhum outro item da navegação
 * "encaixar" melhor na rota atual — sem isso, "Convidados" (/app/convidados)
 * também acendia junto com "Mesas" (/app/convidados/mesas), porque a rota
 * de Mesas começa com o href de Convidados. Também exige limite de barra
 * (`${href}/`) em vez de só `startsWith`, pra "/app/convidados" não bater
 * com uma rota parecida tipo "/app/convidados-x".
 */
export function itemNavAtivo(pathname: string, item: NavItem): boolean {
  const bate = (href: string) =>
    href === "/app"
      ? pathname === "/app"
      : pathname === href || pathname.startsWith(`${href}/`)
  if (!bate(item.href)) return false

  return !NAV_ITEMS.some(
    (outro) =>
      outro.href !== item.href && outro.href.startsWith(item.href) && bate(outro.href)
  )
}
