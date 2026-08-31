"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"

import { salvarOrcamento } from "@/actions/onboarding"
import { CurrencyInput } from "@/components/app/currency-input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { orcamentoSchema, type OrcamentoInput } from "@/lib/validators/onboarding"

export function OrcamentoForm({ valorInicial }: { valorInicial: number | null }) {
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<OrcamentoInput>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: { orcamentoTotal: valorInicial ?? undefined },
  })

  function onSubmit(dados: OrcamentoInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await salvarOrcamento(dados)
      if (resultado?.erro) setErro(resultado.erro)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="orcamentoTotal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orçamento total</FormLabel>
              <FormControl>
                <CurrencyInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {erro && <p className="text-destructive text-sm">{erro}</p>}
        <div className="flex gap-3">
          <Button asChild type="button" variant="outline" className="flex-1">
            <Link href="/inicio/convidados">Voltar</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={pendente}>
            {pendente ? "Salvando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
