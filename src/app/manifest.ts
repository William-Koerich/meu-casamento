import type { MetadataRoute } from "next"

import { NOME_PRODUTO } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: NOME_PRODUTO,
    // Ícone da tela inicial (Android/iOS) trunca short_name perto de 12
    // caracteres — "Organiza meu Casamento" inteiro não caberia.
    short_name: "Organiza",
    description: "Planeje cada detalhe do seu casamento em um só lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f3",
    theme_color: "#6f7350",
    icons: [{ src: "/icon", sizes: "32x32", type: "image/png" }],
  }
}
