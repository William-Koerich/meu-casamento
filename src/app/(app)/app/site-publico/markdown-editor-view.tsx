"use client"

import { useRef, useState, useTransition } from "react"

import {
  atualizarFundoPaginaMarkdown,
  atualizarModoPaginaMarkdown,
  atualizarPaginaMarkdown,
} from "@/actions/page-blocks"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { PaginaMarkdownConteudo } from "@/app/c/[slug]/pagina-markdown"
import { caminhoArquivoStorage } from "@/lib/storage-path"
import { createClient } from "@/lib/supabase/client"

const ATRASO_AUTOSAVE_MS = 800

const TOKENS: { rotulo: string; token: string }[] = [
  { rotulo: "Confirmar presença", token: "\n\n[[rsvp]]\n\n" },
  { rotulo: "Lista de presentes", token: "\n\n[[presentes]]\n\n" },
  { rotulo: "Local e horários", token: "\n\n[[local]]\n\n" },
]

export function MarkdownEditorView({
  weddingId,
  slug,
  ativo: ativoInicial,
  conteudoInicial,
  fundoUrlInicial,
}: {
  weddingId: string
  slug: string
  ativo: boolean
  conteudoInicial: string
  fundoUrlInicial: string | null
}) {
  const [ativo, setAtivo] = useState(ativoInicial)
  const [conteudo, setConteudo] = useState(conteudoInicial)
  const [fundoUrl, setFundoUrl] = useState(fundoUrlInicial)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputImagemRef = useRef<HTMLInputElement>(null)
  const inputFundoRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function alternarAtivo(valor: boolean) {
    setAtivo(valor)
    iniciarTransicao(async () => {
      const resultado = await atualizarModoPaginaMarkdown(valor)
      if (resultado?.erro) setAtivo(!valor)
    })
  }

  function salvarConteudo(valor: string) {
    iniciarTransicao(async () => {
      await atualizarPaginaMarkdown(valor)
    })
  }

  function agendarSalvar(valor: string) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => salvarConteudo(valor), ATRASO_AUTOSAVE_MS)
  }

  function alterarConteudo(valor: string) {
    setConteudo(valor)
    agendarSalvar(valor)
  }

  function inserirToken(token: string) {
    const area = textareaRef.current
    const inicio = area?.selectionStart ?? conteudo.length
    const fim = area?.selectionEnd ?? conteudo.length
    const novoValor = conteudo.slice(0, inicio) + token + conteudo.slice(fim)
    alterarConteudo(novoValor)
    requestAnimationFrame(() => {
      area?.focus()
      area?.setSelectionRange(inicio + token.length, inicio + token.length)
    })
  }

  function selecionarImagem(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ""
    if (!arquivo) return

    setErro(null)
    iniciarTransicao(async () => {
      const supabase = createClient()
      const caminho = caminhoArquivoStorage(weddingId, arquivo)
      const { error } = await supabase.storage.from("blocos").upload(caminho, arquivo)
      if (error) {
        setErro("Não foi possível enviar a imagem.")
        return
      }
      const url = supabase.storage.from("blocos").getPublicUrl(caminho).data.publicUrl
      inserirToken(`\n\n![](${url})\n\n`)
    })
  }

  function selecionarFundo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ""
    if (!arquivo) return

    setErro(null)
    iniciarTransicao(async () => {
      const supabase = createClient()
      const caminho = caminhoArquivoStorage(weddingId, arquivo)
      const { error } = await supabase.storage.from("blocos").upload(caminho, arquivo)
      if (error) {
        setErro("Não foi possível enviar a imagem de fundo.")
        return
      }
      const url = supabase.storage.from("blocos").getPublicUrl(caminho).data.publicUrl
      setFundoUrl(url)
      await atualizarFundoPaginaMarkdown(url)
    })
  }

  function removerFundo() {
    setFundoUrl(null)
    iniciarTransicao(async () => {
      await atualizarFundoPaginaMarkdown(null)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Switch id="modo-markdown" checked={ativo} onCheckedChange={alternarAtivo} />
        <Label htmlFor="modo-markdown">Usar o Markdown na página pública</Label>
      </div>
      <p className="text-muted-foreground text-sm">
        {ativo
          ? "A página pública está usando o conteúdo abaixo em vez do construtor por blocos."
          : "Escreva e salve à vontade — nada aparece em /c/" +
            slug +
            " até você ativar o Markdown acima."}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs">
          Inserir na posição do cursor:
        </span>
        {TOKENS.map((item) => (
          <Button
            key={item.token}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inserirToken(item.token)}
          >
            {item.rotulo}
          </Button>
        ))}
        <input
          ref={inputImagemRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={selecionarImagem}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pendente}
          onClick={() => inputImagemRef.current?.click()}
        >
          Inserir imagem
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Textarea
          ref={textareaRef}
          value={conteudo}
          onChange={(evento) => alterarConteudo(evento.target.value)}
          onBlur={() => salvarConteudo(conteudo)}
          rows={20}
          placeholder={
            "# Maria & William\n\nVamos casar e queremos você com a gente!\n\n[[rsvp]]"
          }
          className="font-mono text-sm"
        />
        <div className="border-border max-h-128 overflow-y-auto rounded border">
          <PaginaMarkdownConteudo conteudo={conteudo} slug={slug} />
        </div>
      </div>

      <div className="border-border space-y-2 border-t pt-4">
        <p className="text-sm font-medium">Imagem de fundo da página</p>
        <p className="text-muted-foreground text-xs">
          Aparece atrás de todo o conteúdo, com uma leve transparência pra manter o texto
          legível.
        </p>
        <div className="flex items-center gap-2">
          <input
            ref={inputFundoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={selecionarFundo}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pendente}
            onClick={() => inputFundoRef.current?.click()}
          >
            {fundoUrl ? "Trocar imagem de fundo" : "Escolher imagem de fundo"}
          </Button>
          {fundoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pendente}
              onClick={removerFundo}
            >
              Remover fundo
            </Button>
          )}
        </div>
      </div>

      {erro && <p className="text-destructive text-sm">{erro}</p>}
    </div>
  )
}
