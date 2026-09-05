import type { Metadata } from "next"
import { CircleAlert, PartyPopper } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { getAlertas } from "@/db/queries/alerts"
import { getMembrosAtribuiveis } from "@/db/queries/members"
import { getMinhaWedding } from "@/db/queries/weddings"

import { TaskRow } from "../checklist/task-row"
import { PaymentAlertRow } from "./payment-alert-row"

export const metadata: Metadata = { title: "Alertas" }

export default async function AlertasPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const [alertas, membros] = await Promise.all([
    getAlertas(wedding.id),
    getMembrosAtribuiveis(wedding.id),
  ])

  const { tarefasAtrasadas, pagamentosVencidos, pagamentosProximos } = alertas
  const total =
    tarefasAtrasadas.length + pagamentosVencidos.length + pagamentosProximos.length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span
          className={
            total === 0
              ? "bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-full"
              : "bg-destructive/10 text-destructive flex size-12 shrink-0 items-center justify-center rounded-full"
          }
        >
          {total === 0 ? (
            <PartyPopper className="size-6" />
          ) : (
            <CircleAlert className="size-6" />
          )}
        </span>
        <div>
          <h1 className="font-heading text-2xl">Alertas</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {total === 0
              ? "Tudo em dia — nenhuma pendência agora."
              : `${total} ${total === 1 ? "pendência precisa" : "pendências precisam"} de atenção`}
          </p>
        </div>
      </div>

      {tarefasAtrasadas.length > 0 && (
        <section>
          <h2 className="font-heading mb-2 text-lg">
            Tarefas atrasadas
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              ({tarefasAtrasadas.length})
            </span>
          </h2>
          <Card>
            <CardContent>
              {tarefasAtrasadas.map((tarefa) => (
                <TaskRow key={tarefa.id} tarefa={tarefa} membros={membros} />
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {pagamentosVencidos.length > 0 && (
        <section>
          <h2 className="font-heading mb-2 text-lg">
            Pagamentos vencidos
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              ({pagamentosVencidos.length})
            </span>
          </h2>
          <Card>
            <CardContent>
              {pagamentosVencidos.map((pagamento) => (
                <PaymentAlertRow key={pagamento.id} pagamento={pagamento} vencido />
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {pagamentosProximos.length > 0 && (
        <section>
          <h2 className="font-heading mb-2 text-lg">
            Pagamentos vencendo em 7 dias
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              ({pagamentosProximos.length})
            </span>
          </h2>
          <Card>
            <CardContent>
              {pagamentosProximos.map((pagamento) => (
                <PaymentAlertRow
                  key={pagamento.id}
                  pagamento={pagamento}
                  vencido={false}
                />
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {total === 0 && (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Nenhuma tarefa atrasada e nenhum pagamento vencendo. Bom trabalho!
        </p>
      )}
    </div>
  )
}
