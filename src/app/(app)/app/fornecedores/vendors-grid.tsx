"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { CategoriaComItens } from "@/db/queries/budget"
import type { Vendor } from "@/db/queries/vendors"
import { CATEGORIA_LABELS, STATUS_FORNECEDOR_LABELS } from "@/lib/labels"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

import { ComparePanel } from "./compare-panel"
import { VendorFormDialog } from "./vendor-form-dialog"

type VendorsGridProps = {
  vendors: Vendor[]
  categoriasOrcamento: Pick<CategoriaComItens, "id" | "nome">[]
}

export function VendorsGrid({ vendors, categoriasOrcamento }: VendorsGridProps) {
  const [modoComparar, setModoComparar] = useState(false)
  const [selecionados, setSelecionados] = useState<string[]>([])

  const grupos = useMemo(() => {
    const mapa = new Map<string, Vendor[]>()
    for (const vendor of vendors) {
      if (!mapa.has(vendor.categoria)) mapa.set(vendor.categoria, [])
      mapa.get(vendor.categoria)!.push(vendor)
    }
    return [...mapa.entries()]
  }, [vendors])

  const vendoresSelecionados = vendors.filter((v) => selecionados.includes(v.id))

  function alternarSelecao(vendor: Vendor) {
    setSelecionados((atual) => {
      if (atual.includes(vendor.id)) return atual.filter((id) => id !== vendor.id)
      if (atual.length >= 3) return atual
      const categoriaAtual = vendors.find((v) => v.id === atual[0])?.categoria
      if (categoriaAtual && categoriaAtual !== vendor.categoria) return atual
      return [...atual, vendor.id]
    })
  }

  function alternarModoComparar() {
    setModoComparar((atual) => !atual)
    setSelecionados([])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant={modoComparar ? "default" : "outline"}
          onClick={alternarModoComparar}
        >
          {modoComparar ? "Sair do modo comparar" : "Comparar fornecedores"}
        </Button>
        <VendorFormDialog
          categoriasOrcamento={categoriasOrcamento}
          trigger={<Button>Novo fornecedor</Button>}
        />
      </div>

      {modoComparar && (
        <p className="text-muted-foreground text-sm">
          Selecione de 2 a 3 fornecedores da mesma categoria para comparar.
        </p>
      )}

      {modoComparar && vendoresSelecionados.length >= 2 && (
        <ComparePanel vendors={vendoresSelecionados} />
      )}

      {vendors.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Nenhum fornecedor cadastrado ainda.
        </p>
      ) : (
        grupos.map(([categoria, itens]) => (
          <div key={categoria}>
            <h2 className="font-heading mb-3 text-lg">
              {CATEGORIA_LABELS[categoria as keyof typeof CATEGORIA_LABELS]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {itens.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  modoComparar={modoComparar}
                  selecionado={selecionados.includes(vendor.id)}
                  onSelecionar={() => alternarSelecao(vendor)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function VendorCard({
  vendor,
  modoComparar,
  selecionado,
  onSelecionar,
}: {
  vendor: Vendor
  modoComparar: boolean
  selecionado: boolean
  onSelecionar: () => void
}) {
  const conteudo = (
    <Card
      className={cn("h-full transition-colors", !modoComparar && "hover:bg-accent/30")}
    >
      <CardContent className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{vendor.nome}</p>
          {vendor.valorProposto && (
            <p className="text-muted-foreground mt-1 text-xs">
              {formatCurrency(vendor.valorProposto)}
            </p>
          )}
          <Badge variant="secondary" className="mt-2">
            {STATUS_FORNECEDOR_LABELS[vendor.status]}
          </Badge>
        </div>
        {modoComparar && (
          <Checkbox
            checked={selecionado}
            onCheckedChange={onSelecionar}
            className="mt-1"
          />
        )}
      </CardContent>
    </Card>
  )

  if (modoComparar) {
    return (
      <button type="button" onClick={onSelecionar} className="block h-full text-left">
        {conteudo}
      </button>
    )
  }

  return (
    <Link href={`/app/fornecedores/${vendor.id}`} className="block h-full">
      {conteudo}
    </Link>
  )
}
