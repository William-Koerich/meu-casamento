import { z } from "zod"

export const confirmarPresencaSchema = z.object({
  statusRsvp: z.enum(["confirmado", "recusado"]),
  acompanhantes: z.number().int().min(0),
  crianca: z.boolean(),
  restricaoAlimentar: z.string().trim().optional(),
})

export type ConfirmarPresencaInput = z.infer<typeof confirmarPresencaSchema>

export const reservarPresenteSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
})

export type ReservarPresenteInput = z.infer<typeof reservarPresenteSchema>
