"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { atualizarPresente, criarPresente } from "@/actions/gifts"
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
import { Textarea } from "@/components/ui/textarea"
import type { Gift } from "@/db/queries/gifts"
import { createClient } from "@/lib/supabase/client"
import { presenteSchema, type PresenteInput } from "@/lib/validators/gifts"

type GiftFormDialogProps = {
  weddingId: string
  gift?: Gift
  trigger: React.ReactNode
}

export function GiftFormDialog({ weddingId, gift, trigger }: GiftFormDialogProps) {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<PresenteInput>({
    resolver: zodResolver(presenteSchema),
    values: {
      nome: gift?.nome ?? "",
      descricao: gift?.descricao ?? "",
      preco: gift?.preco ? Number(gift.preco) : undefined,
      linkLoja: gift?.linkLoja ?? "",
      chavePix: gift?.chavePix ?? "",
      imagemUrl: gift?.imagemUrl ?? "",
    },
  })

  function onSubmit(dados: PresenteInput) {
    setErro(null)
    iniciarTransicao(async () => {
      let imagemUrl = dados.imagemUrl

      if (arquivo) {
        const supabase = createClient()
        const caminho = `${weddingId}/${crypto.randomUUID()}-${arquivo.name}`
        const { error } = await supabase.storage
          .from("presentes")
          .upload(caminho, arquivo)
        if (error) {
          setErro("Não foi possível enviar a imagem.")
          return
        }
        imagemUrl = supabase.storage.from("presentes").getPublicUrl(caminho)
          .data.publicUrl
      }

      const resultado = gift
        ? await atualizarPresente(gift.id, { ...dados, imagemUrl })
        : await criarPresente({ ...dados, imagemUrl })

      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setAberto(false)
      setArquivo(null)
      if (!gift) form.reset()
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{gift ? "Editar presente" : "Novo presente"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <CurrencyInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkLoja"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link da loja</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="chavePix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave Pix (para cota)</FormLabel>
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
                {pendente ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
