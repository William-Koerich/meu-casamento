import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { getWeddingPublicaPorSlug } from "@/db/queries/public-site"

import { UploadFotosForm } from "./upload-fotos-form"

export const metadata: Metadata = { title: "Fotos da festa" }

export default async function FotosPage({ params }: PageProps<"/c/[slug]/fotos">) {
  const { slug } = await params
  const wedding = await getWeddingPublicaPorSlug(slug)
  if (!wedding) notFound()

  return (
    <div className="mx-auto max-w-md space-y-6 px-6 py-12 text-center">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl">Fotos da festa</h1>
        <p className="text-muted-foreground text-sm">
          Tirou uma foto bonita de {wedding.nomeNoiva} & {wedding.nomeNoivo}? Envie aqui
          para o casal guardar essa lembrança.
        </p>
      </div>
      <UploadFotosForm weddingId={wedding.id} />
    </div>
  )
}
