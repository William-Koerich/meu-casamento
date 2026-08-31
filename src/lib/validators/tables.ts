import { z } from "zod"

import { formatoMesaEnum } from "@/db/schema"

const formatos = formatoMesaEnum.enumValues as [string, ...string[]]

export const mesaSchema = z.object({
  nome: z.string().trim().min(1, "Informe um nome."),
  capacidade: z.number().int().min(1, "Informe ao menos 1 lugar."),
  formato: z.enum(formatos, { error: "Escolha um formato." }),
})

export type MesaInput = z.infer<typeof mesaSchema>
