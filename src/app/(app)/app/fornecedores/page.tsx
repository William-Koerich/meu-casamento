import type { Metadata } from "next"

import { getCategoriasComItens } from "@/db/queries/budget"
import { getVendors } from "@/db/queries/vendors"
import { getMinhaWedding } from "@/db/queries/weddings"

import { VendorsGrid } from "./vendors-grid"

export const metadata: Metadata = { title: "Fornecedores" }

export default async function FornecedoresPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const [vendors, categorias] = await Promise.all([
    getVendors(wedding.id),
    getCategoriasComItens(wedding.id),
  ])

  return (
    <div>
      <h1 className="font-heading mb-6 text-2xl">Fornecedores</h1>
      <VendorsGrid
        vendors={vendors}
        categoriasOrcamento={categorias.map(({ id, nome }) => ({ id, nome }))}
      />
    </div>
  )
}
