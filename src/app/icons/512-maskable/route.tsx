import { ImageResponse } from "next/og"

export const dynamic = "force-static"

// Ícone "maskable": o Android pode recortar até a "zona segura" (círculo de
// ~80% do tamanho, centralizado) pra aplicar formas de ícone adaptativas —
// o fundo sólido preenche a borda toda, só a letra precisa ficar menor pra
// nunca ser cortada, diferente do ícone comum (`icons/512`).
export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#6f7350",
        color: "#faf8f3",
        fontSize: 200,
        fontFamily: "serif",
      }}
    >
      O
    </div>,
    { width: 512, height: 512 }
  )
}
