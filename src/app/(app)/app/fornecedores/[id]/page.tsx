import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoriasComItens } from "@/db/queries/budget"
import { getVendor } from "@/db/queries/vendors"
import { getMinhaWedding } from "@/db/queries/weddings"

import { VendorDetail } from "./vendor-detail"

export const metadata: Metadata = { title: "Fornecedor" }

export default async function VendorPage({
  params,
}: PageProps<"/app/fornecedores/[id]">) {
  const { id } = await params
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const [vendor, categorias] = await Promise.all([
    getVendor(id),
    getCategoriasComItens(wedding.id),
  ])
  if (!vendor) notFound()

  return (
    <VendorDetail
      vendor={vendor}
      categoriasOrcamento={categorias.map(({ id, nome }) => ({ id, nome }))}
    />
  )
}
