"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"

import { finalizarOnboarding } from "@/actions/onboarding"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { ESTILOS_CASAMENTO, type EstiloCasamento } from "@/lib/estilos-casamento"
import { cn } from "@/lib/utils"
import { estiloSchema, type EstiloInput } from "@/lib/validators/onboarding"

export function EstiloForm({ valorInicial }: { valorInicial: EstiloCasamento | null }) {
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<EstiloInput>({
    resolver: zodResolver(estiloSchema),
    defaultValues: { estilo: valorInicial ?? undefined },
  })

  function onSubmit(dados: EstiloInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await finalizarOnboarding(dados)
      if (resultado?.erro) setErro(resultado.erro)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="estilo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="grid grid-cols-2 gap-3">
                  {ESTILOS_CASAMENTO.map((estilo) => (
                    <button
                      key={estilo.valor}
                      type="button"
                      onClick={() => field.onChange(estilo.valor)}
                      className={cn(
                        "rounded border p-4 text-left text-sm transition-colors",
                        field.value === estilo.valor
                          ? "border-primary bg-accent"
                          : "border-border hover:bg-accent/50"
                      )}
                    >
                      {estilo.rotulo}
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {erro && <p className="text-destructive text-sm">{erro}</p>}
        <div className="flex gap-3">
          <Button asChild type="button" variant="outline" className="flex-1">
            <Link href="/inicio/orcamento">Voltar</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={pendente}>
            {pendente ? "Concluindo..." : "Concluir"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
