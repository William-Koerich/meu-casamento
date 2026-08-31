import type { MetadataRoute } from "next"

import { NOME_PRODUTO } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: NOME_PRODUTO,
    short_name: NOME_PRODUTO,
    description: "Planeje cada detalhe do seu casamento em um só lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f3",
    theme_color: "#6f7350",
    icons: [{ src: "/icon", sizes: "32x32", type: "image/png" }],
  }
}
