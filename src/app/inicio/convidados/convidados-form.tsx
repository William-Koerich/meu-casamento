"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"

import { salvarConvidados } from "@/actions/onboarding"
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
import { convidadosSchema, type ConvidadosInput } from "@/lib/validators/onboarding"

export function ConvidadosForm({ valorInicial }: { valorInicial: number | null }) {
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<ConvidadosInput>({
    resolver: zodResolver(convidadosSchema),
    defaultValues: { convidadosEstimados: valorInicial ?? undefined },
  })

  function onSubmit(dados: ConvidadosInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await salvarConvidados(dados)
      if (resultado?.erro) setErro(resultado.erro)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="convidadosEstimados"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número estimado de convidados</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  autoFocus
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? ""}
                  onChange={(evento) =>
                    field.onChange(evento.target.valueAsNumber || undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {erro && <p className="text-destructive text-sm">{erro}</p>}
        <div className="flex gap-3">
          <Button asChild type="button" variant="outline" className="flex-1">
            <Link href="/inicio/data">Voltar</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={pendente}>
            {pendente ? "Salvando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
