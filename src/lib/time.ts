export function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number)
  return h * 60 + m
}

export function minutosParaHora(minutosTotais: number): string {
  const minutos = ((minutosTotais % 1440) + 1440) % 1440
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`
}

export function somarMinutos(hora: string, minutos: number): string {
  return minutosParaHora(horaParaMinutos(hora) + minutos)
}
