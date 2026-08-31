"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"

import { salvarDataLocal } from "@/actions/onboarding"
import { DatePickerField } from "@/components/app/date-picker-field"
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
import { dataLocalSchema, type DataLocalInput } from "@/lib/validators/onboarding"

export function DataForm({
  valoresIniciais,
}: {
  valoresIniciais: Partial<DataLocalInput>
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<DataLocalInput>({
    resolver: zodResolver(dataLocalSchema),
    defaultValues: {
      dataCasamento: valoresIniciais.dataCasamento ?? "",
      cidade: valoresIniciais.cidade ?? "",
      estado: valoresIniciais.estado ?? "",
    },
  })

  function onSubmit(dados: DataLocalInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await salvarDataLocal(dados)
      if (resultado?.erro) setErro(resultado.erro)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="dataCasamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data do casamento</FormLabel>
              <FormControl>
                <DatePickerField value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input placeholder="UF" maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {erro && <p className="text-destructive text-sm">{erro}</p>}
        <div className="flex gap-3">
          <Button asChild type="button" variant="outline" className="flex-1">
            <Link href="/inicio/nomes">Voltar</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={pendente}>
            {pendente ? "Salvando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
