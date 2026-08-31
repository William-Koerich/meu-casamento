"use client"

import { useState, useTransition } from "react"

import { buscarConvidadoPorCodigo, buscarConvidadoPublico } from "@/actions/public-search"
import { confirmarPresenca } from "@/actions/public-rsvp"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { getGuestPorCodigo } from "@/db/queries/public-site"
import type { ResultadoBuscaConvidado } from "@/db/queries/public-site"

type Convidado = NonNullable<Awaited<ReturnType<typeof getGuestPorCodigo>>>

export function ConfirmarView({ weddingId }: { weddingId: string }) {
  const [termo, setTermo] = useState("")
  const [candidatos, setCandidatos] = useState<ResultadoBuscaConvidado[]>([])
  const [convidado, setConvidado] = useState<Convidado | null>(null)
  const [concluido, setConcluido] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  function buscar() {
    setErro(null)
    setCandidatos([])
    iniciarTransicao(async () => {
      const resultado = await buscarConvidadoPublico(weddingId, termo)
      if (resultado.tipo === "convidado") {
        setConvidado(resultado.convidado)
      } else if (resultado.tipo === "candidatos") {
        setCandidatos(resultado.candidatos)
      } else {
        setErro("Não encontramos ninguém com esse nome ou código. Confira a grafia.")
      }
    })
  }

  function selecionarCandidato(codigo: string) {
    iniciarTransicao(async () => {
      const encontrado = await buscarConvidadoPorCodigo(codigo)
      if (encontrado) setConvidado(encontrado)
    })
  }

  if (concluido) {
    return (
      <p className="text-center text-sm">
        Obrigado por responder! Mal podemos esperar para celebrar com você.
      </p>
    )
  }

  if (convidado) {
    return <ConfirmForm convidado={convidado} onConcluido={() => setConcluido(true)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Seu nome ou código de convite"
          value={termo}
          onChange={(evento) => setTermo(evento.target.value)}
          onKeyDown={(evento) => evento.key === "Enter" && buscar()}
        />
        <Button type="button" onClick={buscar} disabled={pendente}>
          Buscar
        </Button>
      </div>
      {erro && <p className="text-destructive text-sm">{erro}</p>}
      {candidatos.length > 0 && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Encontramos mais de um resultado:
          </p>
          {candidatos.map((candidato) => (
            <button
              key={candidato.id}
              type="button"
              onClick={() => selecionarCandidato(candidato.codigoRsvp)}
              className="border-border block w-full rounded border p-3 text-left text-sm"
            >
              {candidato.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ConfirmForm({
  convidado,
  onConcluido,
}: {
  convidado: Convidado
  onConcluido: () => void
}) {
  const [statusRsvp, setStatusRsvp] = useState<"confirmado" | "recusado">(
    convidado.statusRsvp === "recusado" ? "recusado" : "confirmado"
  )
  const [acompanhantes, setAcompanhantes] = useState(convidado.acompanhantes)
  const [crianca, setCrianca] = useState(convidado.crianca)
  const [restricao, setRestricao] = useState(convidado.restricaoAlimentar ?? "")
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  function enviar() {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await confirmarPresenca(convidado.codigoRsvp, {
        statusRsvp,
        acompanhantes,
        crianca,
        restricaoAlimentar: restricao,
      })
      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      onConcluido()
    })
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <p className="text-center text-sm">
          Olá, <strong>{convidado.nome}</strong>!
        </p>
        <RadioGroup
          value={statusRsvp}
          onValueChange={(v) => setStatusRsvp(v as typeof statusRsvp)}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="confirmado" id="confirmado" />
            <Label htmlFor="confirmado">Vou comparecer</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="recusado" id="recusado" />
            <Label htmlFor="recusado">Não poderei ir</Label>
          </div>
        </RadioGroup>

        {statusRsvp === "confirmado" && (
          <>
            <div className="space-y-1.5">
              <Label>Acompanhantes</Label>
              <Input
                type="number"
                min={0}
                value={acompanhantes}
                onChange={(evento) => setAcompanhantes(evento.target.valueAsNumber || 0)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={crianca}
                onCheckedChange={(v) => setCrianca(Boolean(v))}
              />
              <Label>Vou levar criança</Label>
            </div>
            <div className="space-y-1.5">
              <Label>Restrição alimentar</Label>
              <Textarea
                rows={2}
                value={restricao}
                onChange={(evento) => setRestricao(evento.target.value)}
              />
            </div>
          </>
        )}

        {erro && <p className="text-destructive text-sm">{erro}</p>}
        <Button type="button" className="w-full" onClick={enviar} disabled={pendente}>
          {pendente ? "Enviando..." : "Enviar resposta"}
        </Button>
      </CardContent>
    </Card>
  )
}
