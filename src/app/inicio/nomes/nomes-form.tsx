"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { salvarNomes } from "@/actions/onboarding"
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
import { nomesSchema, type NomesInput } from "@/lib/validators/onboarding"

export function NomesForm({ valoresIniciais }: { valoresIniciais: Partial<NomesInput> }) {
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<NomesInput>({
    resolver: zodResolver(nomesSchema),
    defaultValues: {
      nomeNoiva: valoresIniciais.nomeNoiva ?? "",
      nomeNoivo: valoresIniciais.nomeNoivo ?? "",
    },
  })

  function onSubmit(dados: NomesInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await salvarNomes(dados)
      if (resultado?.erro) setErro(resultado.erro)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nomeNoiva"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da noiva</FormLabel>
              <FormControl>
                <Input autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nomeNoivo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do noivo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {erro && <p className="text-destructive text-sm">{erro}</p>}
        <Button type="submit" className="w-full" disabled={pendente}>
          {pendente ? "Salvando..." : "Continuar"}
        </Button>
      </form>
    </Form>
  )
}
