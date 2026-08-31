import { z } from "zod"

import { categoriaEnum } from "@/db/schema"

const categorias = categoriaEnum.enumValues as [string, ...string[]]

export const tarefaSchema = z.object({
  titulo: z.string().trim().min(2, "Informe um título."),
  descricao: z.string().trim().optional(),
  categoria: z.enum(categorias, { error: "Escolha uma categoria." }),
  prazo: z.string().optional(),
  responsavelId: z.string().optional(),
})

export type TarefaInput = z.infer<typeof tarefaSchema>
