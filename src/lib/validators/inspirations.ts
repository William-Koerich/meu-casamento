import { z } from "zod"

export const inspiracaoSchema = z.object({
  titulo: z.string().trim().optional(),
  categoria: z.string().trim().optional(),
  linkExterno: z.string().trim().optional(),
  imagemUrl: z.string().trim().optional(),
  notas: z.string().trim().optional(),
})

export type InspiracaoInput = z.infer<typeof inspiracaoSchema>
