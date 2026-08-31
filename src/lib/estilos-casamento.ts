export const ESTILOS_CASAMENTO = [
  { valor: "classico", rotulo: "Clássico" },
  { valor: "rustico", rotulo: "Rústico" },
  { valor: "praia", rotulo: "Praia" },
  { valor: "minimalista", rotulo: "Minimalista" },
  { valor: "boho", rotulo: "Boho" },
  { valor: "religioso_tradicional", rotulo: "Religioso tradicional" },
] as const

export type EstiloCasamento = (typeof ESTILOS_CASAMENTO)[number]["valor"]
