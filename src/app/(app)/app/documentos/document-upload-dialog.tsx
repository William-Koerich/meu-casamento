"use client"

import { useState, useTransition } from "react"

import { criarDocumento } from "@/actions/documents"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TIPO_DOCUMENTO_LABELS } from "@/lib/labels"
import { createClient } from "@/lib/supabase/client"

const SEM_FORNECEDOR = "nenhum"

type DocumentUploadDialogProps = {
  weddingId: string
  vendors: { id: string; nome: string }[]
}

export function DocumentUploadDialog({ weddingId, vendors }: DocumentUploadDialogProps) {
  const [aberto, setAberto] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [tipo, setTipo] = useState<keyof typeof TIPO_DOCUMENTO_LABELS>("outro")
  const [vendorId, setVendorId] = useState(SEM_FORNECEDOR)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  function enviar() {
    if (!arquivo) {
      setErro("Selecione um arquivo.")
      return
    }
    setErro(null)
    iniciarTransicao(async () => {
      const supabase = createClient()
      const caminho = `${weddingId}/${crypto.randomUUID()}-${arquivo.name}`
      const { error } = await supabase.storage.from("documentos").upload(caminho, arquivo)
      if (error) {
        setErro("Não foi possível enviar o arquivo.")
        return
      }

      const resultado = await criarDocumento({
        nome: arquivo.name,
        tipo,
        arquivoUrl: caminho,
        vendorId: vendorId === SEM_FORNECEDOR ? undefined : vendorId,
      })
      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      setAberto(false)
      setArquivo(null)
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button>Enviar documento</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar documento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Arquivo</Label>
            <Input
              type="file"
              onChange={(evento) => setArquivo(evento.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(valor) => setTipo(valor as typeof tipo)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_DOCUMENTO_LABELS).map(([valor, rotulo]) => (
                  <SelectItem key={valor} value={valor}>
                    {rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {vendors.length > 0 && (
            <div className="space-y-1.5">
              <Label>Fornecedor (opcional)</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_FORNECEDOR}>Nenhum</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {erro && <p className="text-destructive text-sm">{erro}</p>}
        </div>
        <DialogFooter>
          <Button type="button" disabled={pendente} onClick={enviar}>
            {pendente ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
