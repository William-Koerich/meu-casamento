"use client"

import { useRef, useState, useTransition } from "react"

import { enviarFotosConvidado } from "@/actions/public-rsvp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { caminhoArquivoStorage } from "@/lib/storage-path"
import { createClient } from "@/lib/supabase/client"

export function UploadFotosForm({ weddingId }: { weddingId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [nome, setNome] = useState("")
  const [arquivos, setArquivos] = useState<File[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [concluido, setConcluido] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  function selecionar(evento: React.ChangeEvent<HTMLInputElement>) {
    setArquivos(Array.from(evento.target.files ?? []))
  }

  function enviar() {
    if (arquivos.length === 0) {
      setErro("Escolha pelo menos uma foto.")
      return
    }

    setErro(null)
    iniciarTransicao(async () => {
      const supabase = createClient()
      const caminhos: string[] = []
      for (const arquivo of arquivos) {
        const caminho = caminhoArquivoStorage(weddingId, arquivo)
        const { error } = await supabase.storage
          .from("fotos-convidados")
          .upload(caminho, arquivo)
        if (!error) caminhos.push(caminho)
      }

      if (caminhos.length === 0) {
        setErro("Não foi possível enviar as fotos. Tente novamente.")
        return
      }

      const resultado = await enviarFotosConvidado(weddingId, caminhos, nome)
      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }

      setConcluido(true)
      setArquivos([])
      if (inputRef.current) inputRef.current.value = ""
    })
  }

  if (concluido) {
    return (
      <div className="border-border rounded border p-6">
        <p className="font-medium">Fotos enviadas, obrigado!</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => setConcluido(false)}
        >
          Enviar mais fotos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1.5">
        <Label htmlFor="nome-convidado">Seu nome (opcional)</Label>
        <Input
          id="nome-convidado"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
        />
      </div>
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
        className="w-full"
        disabled={pendente}
        onClick={() => inputRef.current?.click()}
      >
        {arquivos.length > 0
          ? `${arquivos.length} foto(s) selecionada(s)`
          : "Escolher fotos"}
      </Button>
      <Button type="button" className="w-full" disabled={pendente} onClick={enviar}>
        {pendente ? "Enviando..." : "Enviar fotos"}
      </Button>
      {erro && <p className="text-destructive text-center text-sm">{erro}</p>}
    </div>
  )
}
