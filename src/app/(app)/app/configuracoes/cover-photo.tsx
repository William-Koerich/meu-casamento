"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"

import { atualizarFotoCapa } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export function CoverPhoto({
  weddingId,
  fotoCapaUrl,
}: {
  weddingId: string
  fotoCapaUrl: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(fotoCapaUrl)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

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
    })
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <h2 className="font-heading text-lg">Foto de capa</h2>
        {preview && (
          <Image
            src={preview}
            alt="Foto de capa"
            width={600}
            height={300}
            className="h-40 w-full rounded object-cover"
            unoptimized
          />
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
          {pendente ? "Enviando..." : "Trocar foto"}
        </Button>
        {erro && <p className="text-destructive text-sm">{erro}</p>}
      </CardContent>
    </Card>
  )
}
