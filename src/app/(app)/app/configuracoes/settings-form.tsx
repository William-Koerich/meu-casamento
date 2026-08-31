"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { atualizarConfiguracoes } from "@/actions/settings"
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
import type { weddings } from "@/db/schema"
import { configuracoesSchema, type ConfiguracoesInput } from "@/lib/validators/settings"

export function SettingsForm({ wedding }: { wedding: typeof weddings.$inferSelect }) {
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<ConfiguracoesInput>({
    resolver: zodResolver(configuracoesSchema),
    defaultValues: {
      nomeNoiva: wedding.nomeNoiva,
      nomeNoivo: wedding.nomeNoivo,
      dataCasamento: wedding.dataCasamento ?? "",
      horaCerimonia: wedding.horaCerimonia?.slice(0, 5) ?? "",
      localCerimonia: wedding.localCerimonia ?? "",
      enderecoCerimonia: wedding.enderecoCerimonia ?? "",
      localFesta: wedding.localFesta ?? "",
      enderecoFesta: wedding.enderecoFesta ?? "",
      cidade: wedding.cidade ?? "",
      estado: wedding.estado ?? "",
      dressCode: wedding.dressCode ?? "",
      historiaCasal: wedding.historiaCasal ?? "",
    },
  })

  function onSubmit(dados: ConfiguracoesInput) {
    setErro(null)
    setSalvo(false)
    iniciarTransicao(async () => {
      const resultado = await atualizarConfiguracoes(dados)
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nomeNoiva"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da noiva</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="horaCerimonia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário da cerimônia</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="localCerimonia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local da cerimônia</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enderecoCerimonia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço da cerimônia</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="localFesta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local da festa</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enderecoFesta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço da festa</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                      <Input maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dressCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dress code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="historiaCasal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>História do casal</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
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
