import Link from "next/link"
import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"
import type { BlockPublico } from "@/db/queries/public-site"
import type { BlockConfigFoto, BlockConfigGaleria, BlockConfigTexto } from "@/db/schema"

const NAV_BLOCO: Record<string, { rota: string; rotulo: string }> = {
  nav_rsvp: { rota: "confirmar", rotulo: "Confirmar presença" },
  nav_presentes: { rota: "presentes", rotulo: "Lista de presentes" },
  nav_local: { rota: "local", rotulo: "Local e horários" },
}

export function PublicBlock({
  bloco,
  slug,
  historiaCasal,
}: {
  bloco: BlockPublico
  slug: string
  historiaCasal: string | null
}) {
  if (bloco.tipo === "historia") {
    if (!historiaCasal) return null
    return (
      <section className="mx-auto max-w-xl px-6 py-6">
        <h2 className="font-heading mb-3 text-center text-2xl">Nossa história</h2>
        <p className="text-muted-foreground text-center leading-relaxed whitespace-pre-line">
          {historiaCasal}
        </p>
      </section>
    )
  }

  const nav = NAV_BLOCO[bloco.tipo]
  if (nav) {
    return (
      <section className="mx-auto max-w-xl px-6 py-2">
        <Link href={`/c/${slug}/${nav.rota}`}>
          <Card className="hover:bg-accent/30 text-center transition-colors">
            <CardContent>{nav.rotulo}</CardContent>
          </Card>
        </Link>
      </section>
    )
  }

  if (bloco.tipo === "texto") {
    const config = bloco.config as BlockConfigTexto
    return (
      <section className="mx-auto max-w-xl px-6 py-6">
        {config.titulo && (
          <h2 className="font-heading mb-3 text-center text-2xl">{config.titulo}</h2>
        )}
        <p className="text-muted-foreground text-center leading-relaxed whitespace-pre-line">
          {config.corpo}
        </p>
      </section>
    )
  }

  if (bloco.tipo === "foto") {
    const config = bloco.config as BlockConfigFoto
    return (
      <section className="mx-auto max-w-xl px-6 py-6">
        <div className="relative h-80 w-full overflow-hidden rounded">
          <Image
            src={config.url}
            alt=""
            fill
            unoptimized
            className="object-cover"
            style={{
              objectPosition: `${config.posicaoX}% ${config.posicaoY}%`,
              transform: `scale(${config.zoom / 100})`,
              transformOrigin: `${config.posicaoX}% ${config.posicaoY}%`,
            }}
          />
        </div>
      </section>
    )
  }

  if (bloco.tipo === "galeria") {
    const config = bloco.config as BlockConfigGaleria
    return (
      <section className="mx-auto max-w-2xl px-6 py-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {config.fotos.map((foto) => (
            <Image
              key={foto.url}
              src={foto.url}
              alt=""
              width={300}
              height={300}
              unoptimized
              className="aspect-square w-full rounded object-cover"
            />
          ))}
        </div>
      </section>
    )
  }

  return null
}
