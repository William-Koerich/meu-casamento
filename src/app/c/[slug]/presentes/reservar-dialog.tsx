"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { reservarPresente } from "@/actions/public-rsvp"
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
  reservarPresenteSchema,
  type ReservarPresenteInput,
} from "@/lib/validators/public-rsvp"

export function ReservarDialog({ giftId, nome }: { giftId: string; nome: string }) {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [concluido, setConcluido] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<ReservarPresenteInput>({
    resolver: zodResolver(reservarPresenteSchema),
    defaultValues: { nome: "", email: "" },
  })

  function onSubmit(dados: ReservarPresenteInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await reservarPresente(giftId, dados)
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
        if (!valor) setConcluido(false)
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">Reservar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reservar &ldquo;{nome}&rdquo;</DialogTitle>
        </DialogHeader>
        {concluido ? (
          <p className="text-sm">Presente reservado! Muito obrigado pelo carinho.</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              {erro && <p className="text-destructive text-sm">{erro}</p>}
              <DialogFooter>
                <Button type="submit" disabled={pendente}>
                  {pendente ? "Reservando..." : "Confirmar reserva"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
