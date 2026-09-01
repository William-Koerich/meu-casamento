"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

import { excluirFornecedor } from "@/actions/vendors"
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
import { ContractUpload } from "@/components/app/contract-upload"
import type { CategoriaComItens } from "@/db/queries/budget"
import type { getVendor } from "@/db/queries/vendors"
import { formatCurrency, formatDate } from "@/lib/format"
import { CATEGORIA_LABELS, STATUS_FORNECEDOR_LABELS } from "@/lib/labels"

import { VendorFormDialog } from "../vendor-form-dialog"

type Vendor = NonNullable<Awaited<ReturnType<typeof getVendor>>>

export function VendorDetail({
  vendor,
  categoriasOrcamento,
}: {
  vendor: Vendor
  categoriasOrcamento: Pick<CategoriaComItens, "id" | "nome">[]
}) {
  const router = useRouter()
  const [pendente, iniciarTransicao] = useTransition()

  const pagamentos = vendor.budgetItems.flatMap((item) =>
    item.payments.map((pagamento) => ({ ...pagamento, itemDescricao: item.descricao }))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl">{vendor.nome}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary">{CATEGORIA_LABELS[vendor.categoria]}</Badge>
            <Badge variant="secondary">{STATUS_FORNECEDOR_LABELS[vendor.status]}</Badge>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <VendorFormDialog
            categoriasOrcamento={categoriasOrcamento}
            vendor={vendor}
            trigger={<Button variant="outline">Editar</Button>}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Excluir fornecedor">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{vendor.nome}&rdquo; será removido, junto com os itens de
                  orçamento ligados a ele.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  disabled={pendente}
                  onClick={() =>
                    iniciarTransicao(async () => {
                      await excluirFornecedor(vendor.id)
                      router.push("/app/fornecedores")
                    })
                  }
                >
                  {pendente ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 text-sm">
            <h2 className="font-heading mb-1 text-lg">Contato</h2>
            <p>
              <span className="text-muted-foreground">Nome: </span>
              {vendor.contatoNome || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Telefone: </span>
              {vendor.telefone || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">E-mail: </span>
              {vendor.email || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Instagram: </span>
              {vendor.instagram || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Site: </span>
              {vendor.site || "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 text-sm">
            <h2 className="font-heading mb-1 text-lg">Proposta</h2>
            <p>
              <span className="text-muted-foreground">Valor proposto: </span>
              {vendor.valorProposto ? formatCurrency(vendor.valorProposto) : "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Avaliação: </span>
              {vendor.avaliacao ? `${vendor.avaliacao} / 5` : "—"}
            </p>
            {vendor.observacoes && (
              <p>
                <span className="text-muted-foreground">Observações: </span>
                {vendor.observacoes}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h2 className="font-heading mb-3 text-lg">Contrato</h2>
          <ContractUpload
            weddingId={vendor.weddingId}
            vendorId={vendor.id}
            documentos={vendor.documents}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="font-heading mb-3 text-lg">Histórico de pagamentos</h2>
          {pagamentos.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum pagamento registrado ainda.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {pagamentos.map((pagamento) => (
                <li
                  key={pagamento.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div>
                    <p>{pagamento.descricao}</p>
                    <p className="text-muted-foreground text-xs">
                      {pagamento.itemDescricao}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{formatCurrency(pagamento.valor)}</p>
                    <p className="text-muted-foreground text-xs">
                      {pagamento.pago ? "Pago em " : "Vence em "}
                      {formatDate(
                        pagamento.pago && pagamento.pagoEm
                          ? pagamento.pagoEm
                          : pagamento.vencimento
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
