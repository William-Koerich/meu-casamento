import type { Metadata } from "next"

import { getDocuments } from "@/db/queries/documents"
import { getVendors } from "@/db/queries/vendors"
import { getMinhaWedding } from "@/db/queries/weddings"

import { DocumentUploadDialog } from "./document-upload-dialog"
import { DocumentsList } from "./documents-list"

export const metadata: Metadata = { title: "Documentos" }

export default async function DocumentosPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const [documentos, vendors] = await Promise.all([
    getDocuments(wedding.id),
    getVendors(wedding.id),
  ])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Documentos</h1>
        <DocumentUploadDialog
          weddingId={wedding.id}
          vendors={vendors.map(({ id, nome }) => ({ id, nome }))}
        />
      </div>
      <DocumentsList documentos={documentos} />
    </div>
  )
}
