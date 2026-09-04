import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

// Aliança em vez de monograma — dois círculos aninhados (o de fora cria o
// anel, o de dentro "vaza" o fundo pra virar o furo) em vez de ícone
// importado, pra não depender de asset nenhum.
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#6f7350",
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#faf8f3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#6f7350",
          }}
        />
      </div>
    </div>,
    { ...size }
  )
}
