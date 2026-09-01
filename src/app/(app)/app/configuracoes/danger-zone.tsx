"use client"

import { useState, useTransition } from "react"

import { excluirMinhaConta } from "@/actions/settings"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function DangerZone({ souDona }: { souDona: boolean }) {
  const [confirmacao, setConfirmacao] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  return (
    <Card className="border-destructive/40">
      <CardContent className="space-y-3">
        <h2 className="font-heading text-destructive text-lg">Excluir conta</h2>
        <p className="text-muted-foreground text-sm">
          {souDona
            ? "Isso apaga permanentemente sua conta e todos os dados deste casamento (checklist, orçamento, convidados, tudo)."
            : "Isso apaga permanentemente sua conta e remove seu acesso a este casamento."}
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive border-destructive">
              Excluir minha conta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. Digite EXCLUIR para confirmar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={confirmacao}
              onChange={(evento) => setConfirmacao(evento.target.value)}
              placeholder="EXCLUIR"
            />
            {erro && <p className="text-destructive text-sm">{erro}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={confirmacao !== "EXCLUIR" || pendente}
                onClick={(evento) => {
                  evento.preventDefault()
                  iniciarTransicao(async () => {
                    const resultado = await excluirMinhaConta()
                    if (resultado?.erro) setErro(resultado.erro)
                  })
                }}
              >
                {pendente ? "Excluindo..." : "Excluir permanentemente"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
