import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { getBlocosPublicos, getWeddingPublicaPorSlug } from "@/db/queries/public-site"
import { diasParaCasamento, textoContagemCompacta } from "@/lib/countdown"
import { formatDate } from "@/lib/format"

import { PublicBlock } from "./public-block"

export default async function PaginaPublicaCasal({ params }: PageProps<"/c/[slug]">) {
  const { slug } = await params
  const wedding = await getWeddingPublicaPorSlug(slug)
  if (!wedding) notFound()

  const dias = diasParaCasamento(wedding.dataCasamento)
  const blocos = await getBlocosPublicos(wedding.id)

  return (
    <div>
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
        {wedding.fotoCapaUrl && (
          <Image
            src={wedding.fotoCapaUrl}
            alt=""
            fill
            unoptimized
            className="absolute inset-0 -z-10 object-cover opacity-20"
            style={{
              objectPosition: `${wedding.fotoCapaPosicaoX}% ${wedding.fotoCapaPosicaoY}%`,
              transform: `scale(${wedding.fotoCapaZoom / 100})`,
              transformOrigin: `${wedding.fotoCapaPosicaoX}% ${wedding.fotoCapaPosicaoY}%`,
            }}
          />
        )}
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          Vamos casar
        </p>
        <h1 className="font-heading mt-2 text-4xl sm:text-5xl">
          {wedding.nomeNoiva} & {wedding.nomeNoivo}
        </h1>
        {wedding.dataCasamento && (
          <p className="text-muted-foreground mt-3">
            {formatDate(wedding.dataCasamento)}
          </p>
        )}
        {dias !== null && (
          <p className="font-heading mt-6 text-3xl">{textoContagemCompacta(dias)}</p>
        )}
      </section>

      {blocos.length > 0 ? (
        blocos.map((bloco) => (
          <PublicBlock
            key={bloco.id}
            bloco={bloco}
            slug={slug}
            historiaCasal={wedding.historiaCasal}
          />
        ))
      ) : (
        // Casamento ainda não visitou o construtor de página (/app/site-publico)
        // — mantém o layout fixo de sempre em vez de mostrar uma página vazia.
        <>
          {wedding.historiaCasal && (
            <section className="mx-auto max-w-xl px-6 py-10">
              <h2 className="font-heading mb-3 text-center text-2xl">Nossa história</h2>
              <p className="text-muted-foreground text-center leading-relaxed whitespace-pre-line">
                {wedding.historiaCasal}
              </p>
            </section>
          )}
          <section className="mx-auto grid max-w-xl grid-cols-1 gap-4 px-6 py-10 sm:grid-cols-3">
            <Link href={`/c/${slug}/confirmar`}>
              <Card className="hover:bg-accent/30 h-full text-center transition-colors">
                <CardContent>Confirmar presença</CardContent>
              </Card>
            </Link>
            <Link href={`/c/${slug}/presentes`}>
              <Card className="hover:bg-accent/30 h-full text-center transition-colors">
                <CardContent>Lista de presentes</CardContent>
              </Card>
            </Link>
            <Link href={`/c/${slug}/local`}>
              <Card className="hover:bg-accent/30 h-full text-center transition-colors">
                <CardContent>Local e horários</CardContent>
              </Card>
            </Link>
          </section>
        </>
      )}
    </div>
  )
}
