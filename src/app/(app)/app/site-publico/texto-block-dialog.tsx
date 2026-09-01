"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { adicionarBlocoTexto, atualizarBlocoTexto } from "@/actions/page-blocks"
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
import { Textarea } from "@/components/ui/textarea"
import type { Block } from "@/db/queries/page-blocks"
import type { BlockConfigTexto } from "@/db/schema"
import { textoBlocoSchema, type TextoBlocoInput } from "@/lib/validators/page-blocks"

export function TextoBlockDialog({
  bloco,
  trigger,
}: {
  bloco?: Block
  trigger: React.ReactNode
}) {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const config = bloco?.config as BlockConfigTexto | undefined

  const form = useForm<TextoBlocoInput>({
    resolver: zodResolver(textoBlocoSchema),
    values: {
      titulo: config?.titulo ?? "",
      corpo: config?.corpo ?? "",
    },
  })

  function onSubmit(dados: TextoBlocoInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = bloco
        ? await atualizarBlocoTexto(bloco.id, dados)
        : await adicionarBlocoTexto(dados)

      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setAberto(false)
      if (!bloco) form.reset()
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bloco ? "Editar texto" : "Novo bloco de texto"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título (opcional)</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="corpo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {erro && <p className="text-destructive text-sm">{erro}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pendente}>
                {pendente ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
