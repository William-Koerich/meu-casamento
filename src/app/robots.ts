import type { MetadataRoute } from "next"

import { getUrlBase } from "@/lib/site"

const URL_BASE = getUrlBase()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app", "/app/", "/inicio", "/entrar", "/cadastro", "/convite"],
      },
    ],
    sitemap: `${URL_BASE}/sitemap.xml`,
  }
}
