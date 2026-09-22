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
    // 192/512 são o mínimo pra instalabilidade real (Chrome/Android exige
    // >= 192px); a variante "maskable" evita que a letra seja cortada
    // quando o Android aplica a própria forma de ícone adaptativo.
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/512-maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
