"use client"

import { useTransition } from "react"

import { excluirCasamento, selecionarCasamento } from "@/actions/casamentos"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import { onboardingConcluido } from "@/lib/wedding-status"

type Casamento = {
  id: string
  nomeNoiva: string
  nomeNoivo: string
  dataCasamento: string | null
  estilo: string | null
}

export function CasamentoCard({ casamento }: { casamento: Casamento }) {
  const [pendente, iniciarTransicao] = useTransition()
  const concluido = onboardingConcluido(casamento)

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-lg">
            {casamento.nomeNoiva} & {casamento.nomeNoivo}
          </p>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
            {casamento.dataCasamento && (
              <span>{formatDate(casamento.dataCasamento)}</span>
            )}
            <Badge variant="secondary">
              {concluido ? "Cadastro completo" : "Cadastro incompleto"}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={pendente}
            onClick={() =>
              iniciarTransicao(async () => {
                await selecionarCasamento(casamento.id)
              })
            }
          >
            {concluido ? "Entrar" : "Continuar cadastro"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                aria-label={`Excluir casamento de ${casamento.nomeNoiva} e ${casamento.nomeNoivo}`}
                className="text-destructive text-xs underline"
              >
                Excluir
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir este casamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todo o planejamento de &ldquo;{casamento.nomeNoiva} &{" "}
                  {casamento.nomeNoivo}
                  &rdquo; (checklist, orçamento, convidados, tudo) será apagado. Essa ação
                  não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  disabled={pendente}
                  onClick={() =>
                    iniciarTransicao(async () => {
                      await excluirCasamento(casamento.id)
                    })
                  }
                >
                  {pendente ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
