"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import { X } from "lucide-react"

import { adicionarBloco, atualizarConfigBloco } from "@/actions/page-blocks"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Block } from "@/db/queries/page-blocks"
import type { BlockConfigGaleria } from "@/db/schema"
import { createClient } from "@/lib/supabase/client"

export function GaleriaBlockDialog({
  weddingId,
  bloco,
  trigger,
}: {
  weddingId: string
  bloco?: Block
  trigger: React.ReactNode
}) {
  const config = bloco?.config as BlockConfigGaleria | undefined

  const [aberto, setAberto] = useState(false)
  const [fotos, setFotos] = useState<{ url: string }[]>(config?.fotos ?? [])
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function selecionar(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(evento.target.files ?? [])
    if (arquivos.length === 0) return

    setErro(null)
    iniciarTransicao(async () => {
      const supabase = createClient()
      const novasFotos: { url: string }[] = []
      for (const arquivo of arquivos) {
        const caminho = `${weddingId}/${crypto.randomUUID()}-${arquivo.name}`
        const { error } = await supabase.storage.from("blocos").upload(caminho, arquivo)
        if (error) continue
        const url = supabase.storage.from("blocos").getPublicUrl(caminho).data.publicUrl
        novasFotos.push({ url })
      }
      if (novasFotos.length === 0) {
        setErro("Não foi possível enviar as fotos.")
        return
      }
      setFotos((atual) => [...atual, ...novasFotos])
    })
    evento.target.value = ""
  }

  function remover(url: string) {
    setFotos((atual) => atual.filter((foto) => foto.url !== url))
  }

  function salvar() {
    if (fotos.length === 0) {
      setErro("Adicione pelo menos uma foto.")
      return
    }
    setErro(null)
    const config: BlockConfigGaleria = { fotos }
    iniciarTransicao(async () => {
      const resultado = bloco
        ? await atualizarConfigBloco(bloco.id, config)
        : await adicionarBloco("galeria", config)

      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setAberto(false)
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bloco ? "Editar galeria" : "Nova galeria"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {fotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {fotos.map((foto) => (
                <div key={foto.url} className="group relative">
                  <Image
                    src={foto.url}
                    alt=""
                    width={150}
                    height={150}
                    className="aspect-square w-full rounded object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    aria-label="Remover foto"
                    onClick={() => remover(foto.url)}
                    className="bg-background/90 text-destructive absolute top-1 right-1 rounded-full p-1"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={selecionar}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            disabled={pendente}
            onClick={() => inputRef.current?.click()}
          >
            {pendente ? "Enviando..." : "Adicionar fotos"}
          </Button>
          {erro && <p className="text-destructive text-sm">{erro}</p>}
        </div>
        <DialogFooter>
          <Button type="button" disabled={pendente} onClick={salvar}>
            {pendente ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
