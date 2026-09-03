"use client"

import { useState, useTransition } from "react"

import { atualizarPermissaoMembro, revogarMembro } from "@/actions/members"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TableCell, TableRow } from "@/components/ui/table"
import type { MembroEquipe } from "@/db/queries/members"
import type { weddingMembers } from "@/db/schema"
import { PAPEL_MEMBRO_LABELS, PERMISSAO_LABELS } from "@/lib/labels"
import { getUrlBase } from "@/lib/site"

export function MemberRow({ membro }: { membro: MembroEquipe }) {
  const [permissao, setPermissao] = useState(membro.permissao)
  const [pendente, iniciarTransicao] = useTransition()
  const [copiado, setCopiado] = useState(false)

  async function copiarLink() {
    await navigator.clipboard.writeText(`${getUrlBase()}/convite/${membro.conviteToken}`)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function alterarPermissao(valor: string) {
    const anterior = permissao
    const nova = valor as (typeof weddingMembers.$inferSelect)["permissao"]
    setPermissao(nova)
    iniciarTransicao(async () => {
      const resultado = await atualizarPermissaoMembro(membro.id, nova)
      if (resultado?.erro) setPermissao(anterior)
    })
  }

  return (
    <TableRow>
      <TableCell>
        <p>{membro.profile?.nome ?? membro.conviteEmail}</p>
        <p className="text-muted-foreground text-xs">{membro.conviteEmail}</p>
      </TableCell>
      <TableCell>{PAPEL_MEMBRO_LABELS[membro.papel]}</TableCell>
      <TableCell>
        <Select value={permissao} onValueChange={alterarPermissao}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PERMISSAO_LABELS).map(([valor, rotulo]) => (
              <SelectItem key={valor} value={valor}>
                {rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">
          {membro.conviteAceitoEm ? "Aceito" : "Convite pendente"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-3">
          {!membro.conviteAceitoEm && (
            <button type="button" onClick={copiarLink} className="text-xs underline">
              {copiado ? "Link copiado!" : "Copiar link"}
            </button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button type="button" className="text-destructive text-xs underline">
                Revogar
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revogar acesso?</AlertDialogTitle>
                <AlertDialogDescription>
                  {membro.profile?.nome ?? membro.conviteEmail} perde acesso ao
                  planejamento deste casamento.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  disabled={pendente}
                  onClick={() =>
                    iniciarTransicao(async () => {
                      await revogarMembro(membro.id)
                    })
                  }
                >
                  {pendente ? "Revogando..." : "Revogar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  )
}
