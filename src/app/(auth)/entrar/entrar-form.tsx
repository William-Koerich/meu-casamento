"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { entrar } from "@/actions/auth"
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
import { entrarSchema, type EntrarInput } from "@/lib/validators/auth"

export function EntrarForm({ redirecionarPara }: { redirecionarPara?: string }) {
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<EntrarInput>({
    resolver: zodResolver(entrarSchema),
    defaultValues: { email: "", senha: "" },
  })

  function onSubmit(dados: EntrarInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await entrar(dados, redirecionarPara)
      if (resultado?.erro) {
        setErro(resultado.erro)
      }
    })
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
        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {erro && <p className="text-destructive text-sm">{erro}</p>}
        <Button type="submit" className="w-full" disabled={pendente}>
          {pendente ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  )
}
