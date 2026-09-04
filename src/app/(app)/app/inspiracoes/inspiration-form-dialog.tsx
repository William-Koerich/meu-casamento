"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { criarInspiracao } from "@/actions/inspirations"
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
import { caminhoArquivoStorage } from "@/lib/storage-path"
import { createClient } from "@/lib/supabase/client"
import { inspiracaoSchema, type InspiracaoInput } from "@/lib/validators/inspirations"

export function InspirationFormDialog({ weddingId }: { weddingId: string }) {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<InspiracaoInput>({
    resolver: zodResolver(inspiracaoSchema),
    defaultValues: { titulo: "", categoria: "", linkExterno: "", notas: "" },
  })

  function onSubmit(dados: InspiracaoInput) {
    setErro(null)
    iniciarTransicao(async () => {
      let imagemUrl: string | undefined

      if (arquivo) {
        const supabase = createClient()
        const caminho = caminhoArquivoStorage(weddingId, arquivo)
        const { error } = await supabase.storage
          .from("inspiracoes")
          .upload(caminho, arquivo)
        if (error) {
          setErro("Não foi possível enviar a imagem.")
          return
        }
        imagemUrl = caminho
      }

      const resultado = await criarInspiracao({ ...dados, imagemUrl })
      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setAberto(false)
      setArquivo(null)
      form.reset()
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button>Nova inspiração</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova inspiração</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Decoração, vestido, convites..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-1.5">
              <FormLabel>Imagem</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(evento) => setArquivo(evento.target.files?.[0] ?? null)}
              />
            </div>
            <FormField
              control={form.control}
              name="linkExterno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ou link externo</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
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
                    <Textarea rows={2} {...field} />
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
