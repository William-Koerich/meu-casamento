import { z } from "zod"

export const entrarSchema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
  senha: z.string().min(1, "Informe sua senha."),
})

export type EntrarInput = z.infer<typeof entrarSchema>

export const cadastroSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  tipoConta: z.enum(["noiva", "cerimonialista"]),
})

export type CadastroInput = z.infer<typeof cadastroSchema>

export const recuperarSenhaSchema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
})

export type RecuperarSenhaInput = z.infer<typeof recuperarSenhaSchema>

export const redefinirSenhaSchema = z
  .object({
    senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    confirmarSenha: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  })

export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>
