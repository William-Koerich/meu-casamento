import { z } from "zod"

export const honeymoonDadosSchema = z.object({
  destino: z.string().trim().optional(),
  dataIda: z.string().optional(),
  dataVolta: z.string().optional(),
  orcamento: z.number().min(0).optional(),
  notas: z.string().trim().optional(),
})

export type HoneymoonDadosInput = z.infer<typeof honeymoonDadosSchema>

export const roteiroDiaSchema = z.object({
  dia: z.number().int().min(1),
  titulo: z.string().trim().min(1, "Informe um título."),
  atividades: z.string().trim().optional(),
})

export type RoteiroDiaInput = z.infer<typeof roteiroDiaSchema>
