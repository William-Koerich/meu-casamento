import { z } from "zod"

import { grupoConvidadoEnum, ladoConvidadoEnum } from "@/db/schema"

const grupos = grupoConvidadoEnum.enumValues as [string, ...string[]]
const lados = ladoConvidadoEnum.enumValues as [string, ...string[]]

export const convidadoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  email: z.string().trim().optional(),
  telefone: z.string().trim().optional(),
  grupo: z.enum(grupos, { error: "Escolha um grupo." }),
  lado: z.enum(lados, { error: "Escolha um lado." }),
  acompanhantes: z.number().int().min(0),
  crianca: z.boolean(),
  restricaoAlimentar: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
})

export type ConvidadoInput = z.infer<typeof convidadoSchema>

export const linhaImportacaoSchema = z.object({
  nome: z.string().trim().min(2),
  email: z.string().trim().optional(),
  telefone: z.string().trim().optional(),
  grupo: z.enum(grupos).default("outros"),
  lado: z.enum(lados).default("ambos"),
  acompanhantes: z.number().int().min(0).default(0),
})

export type LinhaImportacao = z.infer<typeof linhaImportacaoSchema>
