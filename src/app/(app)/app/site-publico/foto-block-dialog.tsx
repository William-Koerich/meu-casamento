"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"

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
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { Block } from "@/db/queries/page-blocks"
import type { BlockConfigFoto } from "@/db/schema"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type Posicao = { x: number; y: number }

const ZOOM_MIN = 100
const ZOOM_MAX = 300

function clamp(valor: number, min: number, max: number) {
  return Math.min(max, Math.max(min, valor))
}

export function FotoBlockDialog({
  weddingId,
  bloco,
  trigger,
}: {
  weddingId: string
  bloco?: Block
  trigger: React.ReactNode
}) {
  const config = bloco?.config as BlockConfigFoto | undefined

  const [aberto, setAberto] = useState(false)
  const [preview, setPreview] = useState<string | null>(config?.url ?? null)
  const [posicao, setPosicao] = useState<Posicao>({
    x: config?.posicaoX ?? 50,
    y: config?.posicaoY ?? 50,
  })
  const [zoom, setZoom] = useState(config?.zoom ?? 100)
  const [arrastando, setArrastando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const arrastoRef = useRef<{
    inicioX: number
    inicioY: number
    posicao: Posicao
  } | null>(null)

  function selecionar(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return

    setErro(null)
    iniciarTransicao(async () => {
      const supabase = createClient()
      const caminho = `${weddingId}/${crypto.randomUUID()}-${arquivo.name}`
      const { error } = await supabase.storage.from("blocos").upload(caminho, arquivo)
      if (error) {
        setErro("Não foi possível enviar a foto.")
        return
      }
      const url = supabase.storage.from("blocos").getPublicUrl(caminho).data.publicUrl
      setPreview(url)
      setPosicao({ x: 50, y: 50 })
      setZoom(100)
    })
  }

  function iniciarArrasto(evento: React.PointerEvent<HTMLDivElement>) {
    evento.currentTarget.setPointerCapture(evento.pointerId)
    arrastoRef.current = { inicioX: evento.clientX, inicioY: evento.clientY, posicao }
    setArrastando(true)
  }

  function moverArrasto(evento: React.PointerEvent<HTMLDivElement>) {
    if (!arrastoRef.current || !containerRef.current) return
    const { width, height } = containerRef.current.getBoundingClientRect()
    const { inicioX, inicioY, posicao: posicaoInicial } = arrastoRef.current
    const novoX = clamp(
      posicaoInicial.x - ((evento.clientX - inicioX) / width) * 100,
      0,
      100
    )
    const novoY = clamp(
      posicaoInicial.y - ((evento.clientY - inicioY) / height) * 100,
      0,
      100
    )
    setPosicao({ x: novoX, y: novoY })
  }

  function finalizarArrasto() {
    arrastoRef.current = null
    setArrastando(false)
  }

  function salvar() {
    if (!preview) {
      setErro("Envie uma foto primeiro.")
      return
    }
    setErro(null)
    const config: BlockConfigFoto = {
      url: preview,
      posicaoX: Math.round(posicao.x),
      posicaoY: Math.round(posicao.y),
      zoom: Math.round(zoom),
    }
    iniciarTransicao(async () => {
      const resultado = bloco
        ? await atualizarConfigBloco(bloco.id, config)
        : await adicionarBloco("foto", config)

      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setAberto(false)
    })
  }

  const estiloFoto = {
    objectPosition: `${posicao.x}% ${posicao.y}%`,
    transform: `scale(${zoom / 100})`,
    transformOrigin: `${posicao.x}% ${posicao.y}%`,
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bloco ? "Editar foto" : "Nova foto"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {preview && (
            <>
              <div
                ref={containerRef}
                onPointerDown={iniciarArrasto}
                onPointerMove={moverArrasto}
                onPointerUp={finalizarArrasto}
                onPointerCancel={finalizarArrasto}
                className={cn(
                  "h-56 w-full touch-none overflow-hidden rounded select-none",
                  arrastando ? "cursor-grabbing" : "cursor-grab"
                )}
              >
                <Image
                  src={preview}
                  alt="Prévia da foto"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                  style={estiloFoto}
                  unoptimized
                  draggable={false}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Arraste a foto para ajustar o enquadramento.
              </p>
              <div className="space-y-1.5">
                <Label
                  htmlFor="zoom-bloco-foto"
                  className="text-muted-foreground text-xs"
                >
                  Zoom
                </Label>
                <Slider
                  id="zoom-bloco-foto"
                  min={ZOOM_MIN}
                  max={ZOOM_MAX}
                  step={1}
                  value={[zoom]}
                  onValueChange={(valores) => setZoom(valores[0])}
                />
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={selecionar}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            disabled={pendente}
            onClick={() => inputRef.current?.click()}
          >
            {preview ? "Trocar foto" : "Escolher foto"}
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
