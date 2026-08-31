import type { MetadataRoute } from "next"

const URL_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

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
