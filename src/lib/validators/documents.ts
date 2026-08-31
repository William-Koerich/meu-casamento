import { z } from "zod"

import { tipoDocumentoEnum } from "@/db/schema"

const tipos = tipoDocumentoEnum.enumValues as [string, ...string[]]

export const documentoSchema = z.object({
  nome: z.string().trim().min(2, "Informe um nome."),
  tipo: z.enum(tipos, { error: "Escolha um tipo." }),
  arquivoUrl: z.string().trim().min(1, "Arquivo obrigatório."),
  vendorId: z.string().optional(),
})

export type DocumentoInput = z.infer<typeof documentoSchema>
