"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { criarCasamento } from "@/actions/casamentos"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

export function NovoCasamentoDialog() {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<NomesInput>({
    resolver: zodResolver(nomesSchema),
    defaultValues: { nomeNoiva: "", nomeNoivo: "" },
  })

  function onSubmit(dados: NomesInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await criarCasamento(dados)
      if (resultado?.erro) setErro(resultado.erro)
    })
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        setAberto(valor)
        if (!valor) {
          setErro(null)
          form.reset()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Novo casamento</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar novo casamento</DialogTitle>
        </DialogHeader>
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
            <DialogFooter>
              <Button type="submit" disabled={pendente}>
                {pendente ? "Criando..." : "Continuar cadastro"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
