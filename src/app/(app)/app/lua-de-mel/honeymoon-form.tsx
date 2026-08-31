"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { salvarDadosGerais } from "@/actions/honeymoon"
import { CurrencyInput } from "@/components/app/currency-input"
import { DatePickerField } from "@/components/app/date-picker-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Honeymoon } from "@/db/queries/honeymoon"
import {
  honeymoonDadosSchema,
  type HoneymoonDadosInput,
} from "@/lib/validators/honeymoon"

export function HoneymoonForm({ honeymoon }: { honeymoon: Honeymoon }) {
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<HoneymoonDadosInput>({
    resolver: zodResolver(honeymoonDadosSchema),
    defaultValues: {
      destino: honeymoon?.destino ?? "",
      dataIda: honeymoon?.dataIda ?? "",
      dataVolta: honeymoon?.dataVolta ?? "",
      orcamento: honeymoon?.orcamento ? Number(honeymoon.orcamento) : undefined,
      notas: honeymoon?.notas ?? "",
    },
  })

  function onSubmit(dados: HoneymoonDadosInput) {
    setErro(null)
    setSalvo(false)
    iniciarTransicao(async () => {
      const resultado = await salvarDadosGerais(dados)
      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setSalvo(true)
    })
  }

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="destino"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destino</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataIda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de ida</FormLabel>
                    <FormControl>
                      <DatePickerField value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataVolta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de volta</FormLabel>
                    <FormControl>
                      <DatePickerField value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="orcamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orçamento da viagem</FormLabel>
                  <FormControl>
                    <CurrencyInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {erro && <p className="text-destructive text-sm">{erro}</p>}
            {salvo && <p className="text-muted-foreground text-sm">Salvo.</p>}
            <Button type="submit" disabled={pendente}>
              {pendente ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
