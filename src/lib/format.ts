import { format, formatDistanceToNowStrict } from "date-fns"
import { ptBR } from "date-fns/locale"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function formatCurrency(valor: number | string): string {
  const numero = typeof valor === "string" ? Number(valor) : valor
  return currencyFormatter.format(Number.isFinite(numero) ? numero : 0)
}

export function formatDate(data: Date | string): string {
  const parsed = typeof data === "string" ? new Date(data) : data
  return format(parsed, "dd/MM/yyyy", { locale: ptBR })
}

export function formatDateHora(data: Date | string): string {
  const parsed = typeof data === "string" ? new Date(data) : data
  return format(parsed, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatHora(hora: string): string {
  return hora.slice(0, 5)
}

export function formatDistanciaAgora(data: Date | string): string {
  const parsed = typeof data === "string" ? new Date(data) : data
  return formatDistanceToNowStrict(parsed, { locale: ptBR, addSuffix: true })
}

/** Data de hoje em `yyyy-MM-dd`, para comparar com colunas `date` (string). */
export function hojeISO(): string {
  return format(new Date(), "yyyy-MM-dd")
}
