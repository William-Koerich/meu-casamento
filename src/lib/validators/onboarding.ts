import { z } from "zod"

import { ESTILOS_CASAMENTO } from "@/lib/estilos-casamento"

export const nomesSchema = z.object({
  nomeNoiva: z.string().trim().min(2, "Informe o nome da noiva."),
  nomeNoivo: z.string().trim().min(2, "Informe o nome do noivo."),
})

export type NomesInput = z.infer<typeof nomesSchema>

export const dataLocalSchema = z.object({
  dataCasamento: z.string().min(1, "Informe a data do casamento."),
  cidade: z.string().trim().min(2, "Informe a cidade."),
  estado: z.string().trim().min(2, "Informe o estado."),
})

export type DataLocalInput = z.infer<typeof dataLocalSchema>

export const convidadosSchema = z.object({
  convidadosEstimados: z
    .number({ error: "Informe um número." })
    .int("Informe um número inteiro.")
    .min(1, "Informe ao menos 1 convidado."),
})

export type ConvidadosInput = z.infer<typeof convidadosSchema>

export const orcamentoSchema = z.object({
  orcamentoTotal: z
    .number({ error: "Informe um valor." })
    .positive("Informe um valor maior que zero."),
})

export type OrcamentoInput = z.infer<typeof orcamentoSchema>

const valoresEstilo = ESTILOS_CASAMENTO.map((estilo) => estilo.valor) as [
  string,
  ...string[],
]

export const estiloSchema = z.object({
  estilo: z.enum(valoresEstilo, { error: "Escolha um estilo." }),
})

export type EstiloInput = z.infer<typeof estiloSchema>
