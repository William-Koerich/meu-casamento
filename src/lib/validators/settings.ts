import { z } from "zod"

export const configuracoesSchema = z.object({
  nomeNoiva: z.string().trim().min(2, "Informe o nome da noiva."),
  nomeNoivo: z.string().trim().min(2, "Informe o nome do noivo."),
  dataCasamento: z.string().optional(),
  horaCerimonia: z.string().optional(),
  localCerimonia: z.string().trim().optional(),
  enderecoCerimonia: z.string().trim().optional(),
  localFesta: z.string().trim().optional(),
  enderecoFesta: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  estado: z.string().trim().optional(),
  dressCode: z.string().trim().optional(),
  historiaCasal: z.string().trim().optional(),
})

export type ConfiguracoesInput = z.infer<typeof configuracoesSchema>

export const slugSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "O endereço precisa ter pelo menos 3 caracteres.")
    .regex(/^[a-z0-9-]+$/, "Use só letras minúsculas, números e hífen."),
})

export type SlugInput = z.infer<typeof slugSchema>
