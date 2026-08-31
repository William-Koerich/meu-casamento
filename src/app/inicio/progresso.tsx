import { cn } from "@/lib/utils"

const PASSOS = ["Nomes", "Data e local", "Convidados", "Orçamento", "Estilo"]

export function Progresso({ atual }: { atual: number }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex gap-1">
        {PASSOS.map((passo, index) => (
          <div
            key={passo}
            className={cn(
              "h-1 flex-1 rounded-full",
              index < atual ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        Passo {atual} de {PASSOS.length} — {PASSOS[atual - 1]}
      </p>
    </div>
  )
}
