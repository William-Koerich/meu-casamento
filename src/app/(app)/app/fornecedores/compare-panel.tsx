import { Card, CardContent } from "@/components/ui/card"
import type { Vendor } from "@/db/queries/vendors"
import { formatCurrency } from "@/lib/format"
import { STATUS_FORNECEDOR_LABELS } from "@/lib/labels"

const LINHAS: { rotulo: string; valor: (vendor: Vendor) => React.ReactNode }[] = [
  { rotulo: "Status", valor: (v) => STATUS_FORNECEDOR_LABELS[v.status] },
  {
    rotulo: "Valor proposto",
    valor: (v) => (v.valorProposto ? formatCurrency(v.valorProposto) : "—"),
  },
  { rotulo: "Avaliação", valor: (v) => (v.avaliacao ? `${v.avaliacao} / 5` : "—") },
  { rotulo: "Contato", valor: (v) => v.contatoNome || "—" },
  { rotulo: "Telefone", valor: (v) => v.telefone || "—" },
  { rotulo: "E-mail", valor: (v) => v.email || "—" },
  { rotulo: "Instagram", valor: (v) => v.instagram || "—" },
]

export function ComparePanel({ vendors }: { vendors: Vendor[] }) {
  return (
    <Card>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr>
              <th className="w-32 text-left" />
              {vendors.map((vendor) => (
                <th
                  key={vendor.id}
                  className="font-heading px-2 pb-3 text-left font-medium"
                >
                  {vendor.nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LINHAS.map((linha) => (
              <tr key={linha.rotulo} className="border-border border-t">
                <td className="text-muted-foreground py-2 text-xs">{linha.rotulo}</td>
                {vendors.map((vendor) => (
                  <td key={vendor.id} className="px-2 py-2">
                    {linha.valor(vendor)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
