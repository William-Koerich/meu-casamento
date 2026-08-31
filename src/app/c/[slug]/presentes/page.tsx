import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getGiftsPublicos, getWeddingPublicaPorSlug } from "@/db/queries/public-site"
import { formatCurrency } from "@/lib/format"

import { ReservarDialog } from "./reservar-dialog"

export const metadata: Metadata = { title: "Presentes" }

export default async function PresentesPage({
  params,
}: PageProps<"/c/[slug]/presentes">) {
  const { slug } = await params
  const wedding = await getWeddingPublicaPorSlug(slug)
  if (!wedding) notFound()

  const gifts = await getGiftsPublicos(wedding.id)

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <h1 className="font-heading text-center text-3xl">Lista de presentes</h1>
      {gifts.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">
          Nenhum presente cadastrado ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((gift) => (
            <Card key={gift.id}>
              {gift.imagemUrl && (
                <Image
                  src={gift.imagemUrl}
                  alt={gift.nome}
                  width={400}
                  height={240}
                  className="h-40 w-full rounded-t object-cover"
                  unoptimized
                />
              )}
              <CardContent className="space-y-2">
                <p className="text-sm font-medium">{gift.nome}</p>
                {gift.descricao && (
                  <p className="text-muted-foreground text-xs">{gift.descricao}</p>
                )}
                {gift.preco && <p className="text-sm">{formatCurrency(gift.preco)}</p>}
                {gift.chavePix && (
                  <p className="text-muted-foreground text-xs">Pix: {gift.chavePix}</p>
                )}
                {gift.reservadoPorNome || gift.recebido ? (
                  <Badge variant="secondary">
                    {gift.recebido
                      ? "Já recebido"
                      : `Reservado por ${gift.reservadoPorNome}`}
                  </Badge>
                ) : (
                  <ReservarDialog giftId={gift.id} nome={gift.nome} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
