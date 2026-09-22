import { ImageResponse } from "next/og"

// Sem dado nenhum de request — força geração estática em vez de recalcular
// a imagem a cada acesso (Route Handler é dinâmico por padrão).
export const dynamic = "force-static"

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
        fontSize: 120,
        fontFamily: "serif",
      }}
    >
      O
    </div>,
    { width: 192, height: 192 }
  )
}
