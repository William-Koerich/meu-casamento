"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"

import { atualizarFotoCapa, atualizarPosicaoFotoCapa } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type Posicao = { x: number; y: number }

const ZOOM_MIN = 100
const ZOOM_MAX = 300

function clamp(valor: number, min: number, max: number) {
  return Math.min(max, Math.max(min, valor))
}

export function CoverPhoto({
  weddingId,
  fotoCapaUrl,
  fotoCapaPosicaoX,
  fotoCapaPosicaoY,
  fotoCapaZoom,
}: {
  weddingId: string
  fotoCapaUrl: string | null
  fotoCapaPosicaoX: number
  fotoCapaPosicaoY: number
  fotoCapaZoom: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const arrastoRef = useRef<{
    inicioX: number
    inicioY: number
    posicao: Posicao
  } | null>(null)

  const [preview, setPreview] = useState(fotoCapaUrl)
  const [posicao, setPosicao] = useState<Posicao>({
    x: fotoCapaPosicaoX,
    y: fotoCapaPosicaoY,
  })
  const [zoom, setZoom] = useState(fotoCapaZoom)
  const [editando, setEditando] = useState(false)
  const [arrastando, setArrastando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  function salvarEnquadramento(x: number, y: number, z: number) {
    iniciarTransicao(async () => {
      await atualizarPosicaoFotoCapa(x, y, z)
    })
  }

  function selecionar(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return

    setErro(null)
    iniciarTransicao(async () => {
      const supabase = createClient()
      const caminho = `${weddingId}/${crypto.randomUUID()}-${arquivo.name}`
      const { error } = await supabase.storage.from("capas").upload(caminho, arquivo)
      if (error) {
        setErro("Não foi possível enviar a foto.")
        return
      }
      const url = supabase.storage.from("capas").getPublicUrl(caminho).data.publicUrl
      const resultado = await atualizarFotoCapa(url)
      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setPreview(url)
      setPosicao({ x: 50, y: 50 })
      setZoom(100)
      setEditando(true)
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
    // Arrastar a foto pra baixo deve "descer" o enquadramento (revelar o topo
    // da imagem) — por isso o delta subtrai, em vez de somar, do X/Y inicial.
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
    if (!arrastoRef.current) return
    arrastoRef.current = null
    setArrastando(false)
    salvarEnquadramento(posicao.x, posicao.y, zoom)
  }

  function mudarZoom(valores: number[]) {
    setZoom(valores[0])
  }

  function confirmarZoom(valores: number[]) {
    salvarEnquadramento(posicao.x, posicao.y, valores[0])
  }

  const estiloFoto = {
    objectPosition: `${posicao.x}% ${posicao.y}%`,
    transform: `scale(${zoom / 100})`,
    transformOrigin: `${posicao.x}% ${posicao.y}%`,
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <h2 className="font-heading text-lg">Foto de capa</h2>
        {preview && !editando && (
          <Image
            src={preview}
            alt="Foto de capa"
            width={600}
            height={300}
            className="h-40 w-full rounded object-cover"
            style={estiloFoto}
            unoptimized
          />
        )}
        {preview && editando && (
          <>
            <div
              ref={containerRef}
              onPointerDown={iniciarArrasto}
              onPointerMove={moverArrasto}
              onPointerUp={finalizarArrasto}
              onPointerCancel={finalizarArrasto}
              className={cn(
                "h-40 w-full touch-none overflow-hidden rounded select-none",
                arrastando ? "cursor-grabbing" : "cursor-grab"
              )}
            >
              <Image
                src={preview}
                alt="Foto de capa"
                width={600}
                height={300}
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
              <Label htmlFor="zoom-capa" className="text-muted-foreground text-xs">
                Zoom
              </Label>
              <Slider
                id="zoom-capa"
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={1}
                value={[zoom]}
                onValueChange={mudarZoom}
                onValueCommit={confirmarZoom}
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
        <div className="flex gap-2">
          {preview && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditando((valor) => !valor)}
            >
              {editando ? "Concluir edição" : "Editar posição"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={pendente}
            onClick={() => inputRef.current?.click()}
          >
            {pendente ? "Enviando..." : "Trocar foto"}
          </Button>
        </div>
        {erro && <p className="text-destructive text-sm">{erro}</p>}
      </CardContent>
    </Card>
  )
}
