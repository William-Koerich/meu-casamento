"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { alternarPublicado, atualizarSlug } from "@/actions/settings"
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { slugSchema, type SlugInput } from "@/lib/validators/settings"

export function SlugAndPublish({
  slug,
  publicado,
}: {
  slug: string
  publicado: boolean
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [publicadoAtual, setPublicadoAtual] = useState(publicado)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<SlugInput>({
    resolver: zodResolver(slugSchema),
    values: { slug },
  })

  function onSubmit(dados: SlugInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await atualizarSlug(dados)
      if (resultado?.erro) setErro(resultado.erro)
    })
  }

  function alternar(valor: boolean) {
    setPublicadoAtual(valor)
    iniciarTransicao(async () => {
      const resultado = await alternarPublicado(valor)
      if (resultado?.erro) setPublicadoAtual(!valor)
    })
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="font-heading text-lg">Página pública</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Endereço (meucasamento.com/c/...)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant="outline" disabled={pendente}>
              Salvar
            </Button>
          </form>
        </Form>
        {erro && <p className="text-destructive text-sm">{erro}</p>}
        <div className="flex items-center gap-2 border-t pt-4">
          <Switch checked={publicadoAtual} onCheckedChange={alternar} id="publicado" />
          <Label htmlFor="publicado">
            {publicadoAtual ? "Página pública publicada" : "Página pública despublicada"}
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
