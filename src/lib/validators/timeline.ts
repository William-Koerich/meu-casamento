import { z } from "zod"

export const eventoSchema = z.object({
  titulo: z.string().trim().min(2, "Informe um título."),
  descricao: z.string().trim().optional(),
  responsavel: z.string().trim().optional(),
  local: z.string().trim().optional(),
  duracaoMinutos: z.number().int().min(5, "Informe ao menos 5 minutos."),
  horario: z.string().optional(),
})

export type EventoInput = z.infer<typeof eventoSchema>
