// Anel de progresso só em CSS (conic-gradient), sem lib de gráfico — para
// um número só (percentual) não vale trazer recharts (client component) pro
// dashboard, que é Server Component por padrão. Mesma técnica já usada no
// mockup da landing (marketing/hero.tsx), aqui com dado real.
type ProgressRingProps = {
  percentual: number
  tamanho?: number
  espessura?: number
  destaque?: boolean
}

export function ProgressRing({
  percentual,
  tamanho = 56,
  espessura = 6,
  destaque = false,
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(100, percentual))
  const cor = destaque ? "var(--destructive)" : "var(--primary)"

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: tamanho,
        height: tamanho,
        background: `conic-gradient(${cor} ${pct}%, var(--accent) 0)`,
      }}
    >
      <div
        className="bg-card absolute flex items-center justify-center rounded-full"
        style={{ inset: espessura }}
      >
        <span className="text-xs font-medium">{Math.round(pct)}%</span>
      </div>
    </div>
  )
}
