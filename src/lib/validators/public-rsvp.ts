import { z } from "zod"

// A confirmação pública só pergunta "vai ou não vai" (pedido explícito da
// dona) — acompanhantes/criança/restrição alimentar continuam existindo em
// `guests` e editáveis pela equipe em `/app/convidados`, só não fazem mais
// parte do formulário que o convidado preenche sozinho.
export const confirmarPresencaSchema = z.object({
  statusRsvp: z.enum(["confirmado", "recusado"]),
})

export type ConfirmarPresencaInput = z.infer<typeof confirmarPresencaSchema>

export const reservarPresenteSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
})

export type ReservarPresenteInput = z.infer<typeof reservarPresenteSchema>
