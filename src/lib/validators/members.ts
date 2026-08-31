import { z } from "zod"

import { papelMembroEnum, permissaoMembroEnum } from "@/db/schema"

const papeis = papelMembroEnum.enumValues as [string, ...string[]]
const permissoes = permissaoMembroEnum.enumValues as [string, ...string[]]

export const convidarMembroSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail.").email("E-mail inválido."),
  papel: z.enum(papeis, { error: "Escolha um papel." }),
  permissao: z.enum(permissoes, { error: "Escolha uma permissão." }),
})

export type ConvidarMembroInput = z.infer<typeof convidarMembroSchema>
