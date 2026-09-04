import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// Mesma aliança do favicon (icon.tsx), só em escala maior.
export default function AppleIcon() {
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
          width: 124,
          height: 124,
          borderRadius: "50%",
          background: "#faf8f3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: "#6f7350",
          }}
        />
      </div>
    </div>,
    { ...size }
  )
}
