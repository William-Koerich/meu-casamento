"use client"

import { useTransition } from "react"
import { FileText, Trash2 } from "lucide-react"

import { excluirDocumento, obterUrlAssinadaDocumento } from "@/actions/documents"
import { Card, CardContent } from "@/components/ui/card"
import type { DocumentoComFornecedor } from "@/db/queries/documents"
import { TIPO_DOCUMENTO_LABELS } from "@/lib/labels"

const ORDEM_TIPOS = Object.keys(
  TIPO_DOCUMENTO_LABELS
) as (keyof typeof TIPO_DOCUMENTO_LABELS)[]

export function DocumentsList({ documentos }: { documentos: DocumentoComFornecedor[] }) {
  if (documentos.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        Nenhum documento enviado ainda.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {ORDEM_TIPOS.map((tipo) => {
        const doTipo = documentos.filter((documento) => documento.tipo === tipo)
        if (doTipo.length === 0) return null

        return (
          <div key={tipo}>
            <h2 className="font-heading mb-2 text-lg">{TIPO_DOCUMENTO_LABELS[tipo]}</h2>
            <Card>
              <CardContent>
                {doTipo.map((documento) => (
                  <DocumentRow key={documento.id} documento={documento} />
                ))}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}

function DocumentRow({ documento }: { documento: DocumentoComFornecedor }) {
  const [pendente, iniciarTransicao] = useTransition()

  async function abrir() {
    const resultado = await obterUrlAssinadaDocumento(documento.arquivoUrl)
    if ("url" in resultado) window.open(resultado.url, "_blank")
  }

  return (
    <div className="border-border flex items-center justify-between gap-3 border-b py-2 text-sm last:border-b-0">
      <button
        type="button"
        disabled={pendente}
        onClick={() => iniciarTransicao(() => abrir())}
        className="flex min-w-0 flex-1 items-center gap-2 text-left underline disabled:opacity-50"
      >
        <FileText className="text-muted-foreground size-4 shrink-0" />
        <span className="truncate">{pendente ? "Abrindo..." : documento.nome}</span>
      </button>
      {documento.vendor && (
        <span className="text-muted-foreground shrink-0 text-xs">
          {documento.vendor.nome}
        </span>
      )}
      <button
        type="button"
        aria-label={`Excluir ${documento.nome}`}
        disabled={pendente}
        onClick={() =>
          iniciarTransicao(async () => {
            await excluirDocumento(documento.id)
          })
        }
        className="text-muted-foreground hover:text-destructive shrink-0 disabled:opacity-50"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}
