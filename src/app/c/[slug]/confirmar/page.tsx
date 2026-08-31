import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { getWeddingPublicaPorSlug } from "@/db/queries/public-site"

import { ConfirmarView } from "./confirmar-view"

export const metadata: Metadata = { title: "Confirmar presença" }

export default async function ConfirmarPage({
  params,
}: PageProps<"/c/[slug]/confirmar">) {
  const { slug } = await params
  const wedding = await getWeddingPublicaPorSlug(slug)
  if (!wedding) notFound()

  return (
    <div className="mx-auto max-w-md space-y-6 px-6 py-12">
      <h1 className="font-heading text-center text-3xl">Confirmar presença</h1>
      <p className="text-muted-foreground text-center text-sm">
        Busque pelo seu nome ou pelo código que você recebeu no convite.
      </p>
      <ConfirmarView weddingId={wedding.id} />
    </div>
  )
}
