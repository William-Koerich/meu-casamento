import { z } from "zod"

import { categoriaEnum, statusFornecedorEnum } from "@/db/schema"

const categorias = categoriaEnum.enumValues as [string, ...string[]]
const status = statusFornecedorEnum.enumValues as [string, ...string[]]

export const fornecedorSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  categoria: z.enum(categorias, { error: "Escolha uma categoria." }),
  contatoNome: z.string().trim().optional(),
  telefone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  site: z.string().trim().optional(),
  valorProposto: z.number().min(0).optional(),
  status: z.enum(status, { error: "Escolha um status." }),
  avaliacao: z.number().int().min(1).max(5).optional(),
  observacoes: z.string().trim().optional(),
})

export type FornecedorInput = z.infer<typeof fornecedorSchema>
