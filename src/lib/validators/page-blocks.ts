import { z } from "zod"

export const textoBlocoSchema = z.object({
  titulo: z.string().trim().optional(),
  corpo: z.string().trim().min(1, "Escreva algum texto."),
})

export type TextoBlocoInput = z.infer<typeof textoBlocoSchema>
