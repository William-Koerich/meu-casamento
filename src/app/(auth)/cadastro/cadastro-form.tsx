"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { cadastrar } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cadastroSchema, type CadastroInput } from "@/lib/validators/auth"

export function CadastroForm() {
  const [erro, setErro] = useState<string | null>(null)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<CadastroInput>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nome: "", email: "", senha: "" },
  })

  function onSubmit(dados: CadastroInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await cadastrar(dados)
      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      if (resultado?.precisaConfirmarEmail) {
        setEmailEnviado(true)
      }
    })
  }

  if (emailEnviado) {
    return (
      <p className="text-muted-foreground text-center text-sm">
        Enviamos um link de confirmação para o seu e-mail. Assim que confirmar, é só
        entrar normalmente.
      </p>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {erro && <p className="text-destructive text-sm">{erro}</p>}
        <Button type="submit" className="w-full" disabled={pendente}>
          {pendente ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </Form>
  )
}
