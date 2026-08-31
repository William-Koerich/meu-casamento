import { z } from "zod"

import { comodoEnxovalEnum, prioridadeEnxovalEnum } from "@/db/schema"

const comodos = comodoEnxovalEnum.enumValues as [string, ...string[]]
const prioridades = prioridadeEnxovalEnum.enumValues as [string, ...string[]]

export const itemEnxovalSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  comodo: z.enum(comodos, { error: "Escolha um cômodo." }),
  quantidade: z.number().int().min(1),
  prioridade: z.enum(prioridades, { error: "Escolha uma prioridade." }),
  precoEstimado: z.number().min(0).optional(),
})

export type ItemEnxovalInput = z.infer<typeof itemEnxovalSchema>
