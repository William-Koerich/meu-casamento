import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { Card, CardContent } from "@/components/ui/card"
import { getWeddingPublicaPorSlug } from "@/db/queries/public-site"
import { formatHora } from "@/lib/format"

export const metadata: Metadata = { title: "Local e horários" }

function mapaEmbedUrl(endereco: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(endereco)}&output=embed`
}

export default async function LocalPage({ params }: PageProps<"/c/[slug]/local">) {
  const { slug } = await params
  const wedding = await getWeddingPublicaPorSlug(slug)
  if (!wedding) notFound()

  return (
    <div className="mx-auto max-w-xl space-y-6 px-6 py-12">
      <h1 className="font-heading text-center text-3xl">Local e horários</h1>

      {wedding.localCerimonia && (
        <Card>
          <CardContent className="space-y-2">
            <h2 className="font-heading text-lg">Cerimônia</h2>
            <p>{wedding.localCerimonia}</p>
            {wedding.enderecoCerimonia && (
              <p className="text-muted-foreground text-sm">{wedding.enderecoCerimonia}</p>
            )}
            {wedding.horaCerimonia && (
              <p className="text-sm">{formatHora(wedding.horaCerimonia)}</p>
            )}
            {wedding.enderecoCerimonia && (
              <iframe
                title="Mapa da cerimônia"
                src={mapaEmbedUrl(wedding.enderecoCerimonia)}
                className="h-56 w-full rounded border-0"
                loading="lazy"
              />
            )}
          </CardContent>
        </Card>
      )}

      {wedding.localFesta && (
        <Card>
          <CardContent className="space-y-2">
            <h2 className="font-heading text-lg">Festa</h2>
            <p>{wedding.localFesta}</p>
            {wedding.enderecoFesta && (
              <p className="text-muted-foreground text-sm">{wedding.enderecoFesta}</p>
            )}
            {wedding.enderecoFesta && (
              <iframe
                title="Mapa da festa"
                src={mapaEmbedUrl(wedding.enderecoFesta)}
                className="h-56 w-full rounded border-0"
                loading="lazy"
              />
            )}
          </CardContent>
        </Card>
      )}

      {wedding.dressCode && (
        <Card>
          <CardContent>
            <h2 className="font-heading text-lg">Dress code</h2>
            <p className="text-muted-foreground text-sm">{wedding.dressCode}</p>
          </CardContent>
        </Card>
      )}

      {!wedding.localCerimonia && !wedding.localFesta && (
        <p className="text-muted-foreground text-center text-sm">
          Local ainda não definido. Volte em breve!
        </p>
      )}
    </div>
  )
}
