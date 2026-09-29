"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { contribuirPresente } from "@/actions/public-rsvp"
import { CurrencyInput } from "@/components/app/currency-input"
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
import {
  contribuirPresenteSchema,
  type ContribuirPresenteInput,
} from "@/lib/validators/public-rsvp"

export function ContribuirDialog({
  giftId,
  nome,
  chavePix,
  faltam,
}: {
  giftId: string
  nome: string
  chavePix: string | null
  faltam: string
}) {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [concluido, setConcluido] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<ContribuirPresenteInput>({
    resolver: zodResolver(contribuirPresenteSchema),
    defaultValues: { nome: "", email: "", valor: undefined },
  })

  function onSubmit(dados: ContribuirPresenteInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await contribuirPresente(giftId, dados)
      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setConcluido(true)
    })
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        setAberto(valor)
        if (!valor) {
          setConcluido(false)
          form.reset()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">Contribuir</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contribuir com &ldquo;{nome}&rdquo;</DialogTitle>
        </DialogHeader>
        {concluido ? (
          <p className="text-sm">
            Contribuição registrada! Muito obrigado pelo carinho — não esqueça de fazer o
            Pix {chavePix ? `pra chave ${chavePix}` : "combinado com o casal"}.
          </p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {chavePix && (
                <p className="text-muted-foreground text-xs">
                  Ainda faltam {faltam} pra completar esse presente. Chave Pix:{" "}
                  <span className="text-foreground">{chavePix}</span>
                </p>
              )}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu nome</FormLabel>
                    <FormControl>
                      <Input autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu e-mail</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quanto você vai contribuir</FormLabel>
                    <FormControl>
                      <CurrencyInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {erro && <p className="text-destructive text-sm">{erro}</p>}
              <DialogFooter>
                <Button type="submit" disabled={pendente}>
                  {pendente ? "Enviando..." : "Confirmar contribuição"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
