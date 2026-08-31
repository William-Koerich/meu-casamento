import { z } from "zod"

export const presenteSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  descricao: z.string().trim().optional(),
  preco: z.number().min(0).optional(),
  linkLoja: z.string().trim().optional(),
  chavePix: z.string().trim().optional(),
  imagemUrl: z.string().trim().optional(),
})

export type PresenteInput = z.infer<typeof presenteSchema>
