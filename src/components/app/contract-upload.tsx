"use client"

import { useRef, useState, useTransition } from "react"

import { criarDocumento, obterUrlAssinadaDocumento } from "@/actions/documents"
import { Button } from "@/components/ui/button"
import type { documents } from "@/db/schema"
import { createClient } from "@/lib/supabase/client"

type ContractUploadProps = {
  weddingId: string
  vendorId: string
  documentos: (typeof documents.$inferSelect)[]
}

export function ContractUpload({ weddingId, vendorId, documentos }: ContractUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  async function enviarArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return

    setEnviando(true)
    setErro(null)

    const caminho = `${weddingId}/${crypto.randomUUID()}-${arquivo.name}`
    const supabase = createClient()
    const { error } = await supabase.storage.from("documentos").upload(caminho, arquivo)

    if (error) {
      setErro("Não foi possível enviar o arquivo.")
      setEnviando(false)
      return
    }

    const resultado = await criarDocumento({
      nome: arquivo.name,
      tipo: "contrato",
      arquivoUrl: caminho,
      vendorId,
    })

    if (resultado?.erro) setErro(resultado.erro)
    setEnviando(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function abrirDocumento(caminho: string) {
    const resultado = await obterUrlAssinadaDocumento(caminho)
    if ("url" in resultado) window.open(resultado.url, "_blank")
  }

  return (
    <div className="space-y-3">
      {documentos.length > 0 && (
        <ul className="space-y-1">
          {documentos.map((documento) => (
            <li key={documento.id}>
              <button
                type="button"
                disabled={pendente}
                onClick={() =>
                  iniciarTransicao(() => abrirDocumento(documento.arquivoUrl))
                }
                className="text-sm underline disabled:opacity-50"
              >
                {pendente ? "Abrindo..." : documento.nome}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          onChange={enviarArquivo}
          className="hidden"
          id={`upload-contrato-${vendorId}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={enviando}
          onClick={() => inputRef.current?.click()}
        >
          {enviando ? "Enviando..." : "Enviar contrato"}
        </Button>
        {erro && <p className="text-destructive mt-1 text-sm">{erro}</p>}
      </div>
    </div>
  )
}
