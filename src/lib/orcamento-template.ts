export type CategoriaOrcamentoTemplate = {
  nome: string
  percentual: number
  cor: string
}

// Percentuais aplicados sobre o orçamento total ao concluir o onboarding
// (ver src/actions/onboarding.ts). Soma = 100%.
export const ORCAMENTO_TEMPLATE: CategoriaOrcamentoTemplate[] = [
  { nome: "Buffet", percentual: 30, cor: "#6f7350" },
  { nome: "Local", percentual: 15, cor: "#a8442e" },
  { nome: "Fotografia e vídeo", percentual: 10, cor: "#b89b5e" },
  { nome: "Decoração e flores", percentual: 10, cor: "#7f8a99" },
  { nome: "Vestuário e beleza", percentual: 10, cor: "#9c8567" },
  { nome: "Música", percentual: 8, cor: "#8a6f9c" },
  { nome: "Bolo e doces", percentual: 4, cor: "#c98a6b" },
  { nome: "Convites e papelaria", percentual: 4, cor: "#5e8a7a" },
  { nome: "Cerimonial", percentual: 4, cor: "#a67f8e" },
  { nome: "Lembrancinhas", percentual: 3, cor: "#8f9c5e" },
  { nome: "Outros", percentual: 2, cor: "#8a8378" },
]
