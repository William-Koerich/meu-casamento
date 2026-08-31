import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { getWeddingPublicaPorSlug } from "@/db/queries/public-site"

const NAV = [
  { rotulo: "Início", href: "" },
  { rotulo: "Confirmar presença", href: "/confirmar" },
  { rotulo: "Presentes", href: "/presentes" },
  { rotulo: "Local", href: "/local" },
]

export async function generateMetadata({
  params,
}: LayoutProps<"/c/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const wedding = await getWeddingPublicaPorSlug(slug)
  if (!wedding) return {}

  const titulo = `${wedding.nomeNoiva} & ${wedding.nomeNoivo}`
  const descricao =
    wedding.historiaCasal?.slice(0, 160) ||
    "Acompanhe e confirme presença no nosso casamento."

  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      images: wedding.fotoCapaUrl ? [{ url: wedding.fotoCapaUrl }] : undefined,
    },
  }
}

export default async function PublicWeddingLayout({
  children,
  params,
}: LayoutProps<"/c/[slug]">) {
  const { slug } = await params
  const wedding = await getWeddingPublicaPorSlug(slug)
  if (!wedding) notFound()

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border bg-background/95 sticky top-0 z-30 border-b backdrop-blur">
        <nav className="mx-auto flex max-w-3xl items-center justify-center gap-4 overflow-x-auto px-4 py-3 text-sm sm:gap-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={`/c/${slug}${item.href}`}
              className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="text-muted-foreground border-border border-t py-6 text-center text-xs">
        {wedding.nomeNoiva} & {wedding.nomeNoivo}
      </footer>
    </div>
  )
}
