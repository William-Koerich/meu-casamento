import { differenceInCalendarDays } from "date-fns"

export function diasParaCasamento(
  dataCasamento: string | null | undefined
): number | null {
  if (!dataCasamento) return null
  return differenceInCalendarDays(new Date(`${dataCasamento}T00:00:00`), new Date())
}

export function textoContagemCompacta(dias: number | null): string {
  if (dias === null) return "Data ainda não definida"
  if (dias > 1) return `Faltam ${dias} dias`
  if (dias === 1) return "Falta 1 dia"
  if (dias === 0) return "É hoje!"
  return "Já aconteceu"
}
