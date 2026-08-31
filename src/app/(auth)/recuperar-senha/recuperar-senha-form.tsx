"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { recuperarSenha } from "@/actions/auth"
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
import { recuperarSenhaSchema, type RecuperarSenhaInput } from "@/lib/validators/auth"

export function RecuperarSenhaForm() {
  const [erro, setErro] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<RecuperarSenhaInput>({
    resolver: zodResolver(recuperarSenhaSchema),
    defaultValues: { email: "" },
  })

  function onSubmit(dados: RecuperarSenhaInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await recuperarSenha(dados)
      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setEnviado(true)
    })
  }

  if (enviado) {
    return (
      <p className="text-muted-foreground text-center text-sm">
        Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha.
      </p>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        {erro && <p className="text-destructive text-sm">{erro}</p>}
        <Button type="submit" className="w-full" disabled={pendente}>
          {pendente ? "Enviando..." : "Enviar link de recuperação"}
        </Button>
      </form>
    </Form>
  )
}
