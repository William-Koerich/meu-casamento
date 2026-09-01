"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { GuestComMesa } from "@/db/queries/guests"
import { GRUPO_LABELS, LADO_LABELS } from "@/lib/labels"

import { GuestFormDialog } from "./guest-form-dialog"
import { GuestRowActions } from "./guest-row-actions"
import { ImportCsvDialog } from "./import-csv-dialog"
import { RsvpSelect } from "./rsvp-select"

const TODOS = "todos"

type Ordenacao = "nome" | "grupo" | "acompanhantes"

export function GuestsView({ guests, slug }: { guests: GuestComMesa[]; slug: string }) {
  const [busca, setBusca] = useState("")
  const [grupo, setGrupo] = useState(TODOS)
  const [lado, setLado] = useState(TODOS)
  const [status, setStatus] = useState(TODOS)
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("nome")

  const contadores = useMemo(() => {
    const totalPessoas = guests.reduce((soma, g) => soma + 1 + g.acompanhantes, 0)
    return {
      total: guests.length,
      totalPessoas,
      confirmados: guests.filter((g) => g.statusRsvp === "confirmado").length,
      pendentes: guests.filter((g) => g.statusRsvp === "pendente").length,
      recusados: guests.filter((g) => g.statusRsvp === "recusado").length,
    }
  }, [guests])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return guests
      .filter((g) => {
        if (
          termo &&
          !g.nome.toLowerCase().includes(termo) &&
          !g.email?.toLowerCase().includes(termo)
        ) {
          return false
        }
        if (grupo !== TODOS && g.grupo !== grupo) return false
        if (lado !== TODOS && g.lado !== lado) return false
        if (status !== TODOS && g.statusRsvp !== status) return false
        return true
      })
      .sort((a, b) => {
        if (ordenacao === "acompanhantes") return b.acompanhantes - a.acompanhantes
        return a[ordenacao].localeCompare(b[ordenacao])
      })
  }, [guests, busca, grupo, lado, status, ordenacao])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { rotulo: "Convidados", valor: contadores.total },
          { rotulo: "Total de pessoas", valor: contadores.totalPessoas },
          { rotulo: "Confirmados", valor: contadores.confirmados },
          { rotulo: "Pendentes", valor: contadores.pendentes },
        ].map((item) => (
          <Card key={item.rotulo}>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-xs">{item.rotulo}</p>
              <p className="mt-1 text-xl font-medium">{item.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Buscar por nome ou e-mail"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            className="w-56"
          />
          <Select value={grupo} onValueChange={setGrupo}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos os grupos</SelectItem>
              {Object.entries(GRUPO_LABELS).map(([valor, rotulo]) => (
                <SelectItem key={valor} value={valor}>
                  {rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={lado} onValueChange={setLado}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Lado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos os lados</SelectItem>
              {Object.entries(LADO_LABELS).map(([valor, rotulo]) => (
                <SelectItem key={valor} value={valor}>
                  {rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="RSVP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos os status</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="recusado">Recusado</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={ordenacao}
            onValueChange={(valor) => setOrdenacao(valor as Ordenacao)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nome">Nome</SelectItem>
              <SelectItem value="grupo">Grupo</SelectItem>
              <SelectItem value="acompanhantes">Acompanhantes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <ImportCsvDialog />
          <GuestFormDialog trigger={<Button>Novo convidado</Button>} />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Nenhum convidado encontrado com esses filtros.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Lado</TableHead>
                <TableHead>Acompanhantes</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>
                    <p>{guest.nome}</p>
                    {guest.email && (
                      <p className="text-muted-foreground text-xs">{guest.email}</p>
                    )}
                  </TableCell>
                  <TableCell>{GRUPO_LABELS[guest.grupo]}</TableCell>
                  <TableCell>{LADO_LABELS[guest.lado]}</TableCell>
                  <TableCell>{guest.acompanhantes}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {guest.table?.nome ?? "—"}
                  </TableCell>
                  <TableCell>
                    <RsvpSelect guestId={guest.id} statusAtual={guest.statusRsvp} />
                  </TableCell>
                  <TableCell>
                    <GuestRowActions guest={guest} slug={slug} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
