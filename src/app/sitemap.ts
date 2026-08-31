import type { MetadataRoute } from "next"

import { getSlugsPublicados } from "@/db/queries/sitemap"

const URL_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paginasEstaticas: MetadataRoute.Sitemap = [
    { url: URL_BASE, changeFrequency: "monthly", priority: 1 },
    { url: `${URL_BASE}/precos`, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${URL_BASE}/para-cerimonialistas`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: `${URL_BASE}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${URL_BASE}/termos`, changeFrequency: "yearly", priority: 0.3 },
  ]

  const weddings = await getSlugsPublicados()
  const paginasPublicas: MetadataRoute.Sitemap = weddings.map((wedding) => ({
    url: `${URL_BASE}/c/${wedding.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }))

  return [...paginasEstaticas, ...paginasPublicas]
}
