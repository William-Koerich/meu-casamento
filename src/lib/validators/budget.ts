import { z } from "zod"

export const itemOrcamentoSchema = z.object({
  categoryId: z.string().min(1, "Escolha uma categoria."),
  vendorId: z.string().optional(),
  descricao: z.string().trim().min(2, "Informe uma descrição."),
  valorPrevisto: z.number().min(0).optional(),
  valorContratado: z.number().min(0).optional(),
})

export type ItemOrcamentoInput = z.infer<typeof itemOrcamentoSchema>

export const pagamentoSchema = z.object({
  budgetItemId: z.string().min(1, "Escolha um item."),
  descricao: z.string().trim().min(2, "Informe uma descrição."),
  valor: z.number().positive("Informe um valor maior que zero."),
  vencimento: z.string().min(1, "Informe o vencimento."),
  formaPagamento: z.string().optional(),
})

export type PagamentoInput = z.infer<typeof pagamentoSchema>
