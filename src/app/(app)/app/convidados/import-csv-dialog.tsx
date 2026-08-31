"use client"

import { useRef, useState, useTransition } from "react"

import { importarConvidadosCsv } from "@/actions/guests"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { parseCsv } from "@/lib/csv"

const CABECALHOS_ACEITOS: Record<string, string> = {
  nome: "nome",
  email: "email",
  telefone: "telefone",
  grupo: "grupo",
  lado: "lado",
  acompanhantes: "acompanhantes",
}

function linhasParaObjetos(linhas: string[][]) {
  const [cabecalho, ...resto] = linhas
  const indices = cabecalho.map(
    (coluna) => CABECALHOS_ACEITOS[coluna.trim().toLowerCase()]
  )

  return resto.map((linha) => {
    const objeto: Record<string, string | number> = {}
    linha.forEach((valor, indice) => {
      const chave = indices[indice]
      if (!chave) return
      objeto[chave] = chave === "acompanhantes" ? Number(valor) || 0 : valor
    })
    return objeto
  })
}

export function ImportCsvDialog() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [aberto, setAberto] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  function selecionarArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return

    setMensagem(null)
    const leitor = new FileReader()
    leitor.onload = () => {
      const texto = String(leitor.result ?? "")
      const linhas = parseCsv(texto)
      const objetos = linhasParaObjetos(linhas)

      iniciarTransicao(async () => {
        const resultado = await importarConvidadosCsv(objetos)
        if (resultado.erro) {
          setMensagem(resultado.erro)
          return
        }
        setMensagem(`${resultado.importados} convidado(s) importado(s).`)
      })
    }
    leitor.readAsText(arquivo, "utf-8")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline">Importar CSV</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar convidados por CSV</DialogTitle>
          <DialogDescription>
            O arquivo precisa ter uma primeira linha com os cabeçalhos: nome, email,
            telefone, grupo, lado, acompanhantes. Só &ldquo;nome&rdquo; é obrigatório.
          </DialogDescription>
        </DialogHeader>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={selecionarArquivo}
          disabled={pendente}
        />
        {mensagem && <p className="text-muted-foreground text-sm">{mensagem}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setAberto(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
