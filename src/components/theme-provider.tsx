"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

import { ehTema, TEMA_STORAGE_KEY, type Tema } from "@/lib/theme"

type ThemeContextValue = {
  tema: Tema
  definirTema: (tema: Tema) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function lerTemaSalvo(): Tema {
  if (typeof window === "undefined") return "sistema"
  try {
    const salvo = localStorage.getItem(TEMA_STORAGE_KEY)
    return ehTema(salvo) ? salvo : "sistema"
  } catch {
    return "sistema"
  }
}

function aplicarTema(tema: Tema) {
  const escuro =
    tema === "escuro" ||
    (tema === "sistema" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", escuro)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>(lerTemaSalvo)

  useEffect(() => {
    aplicarTema(tema)
    try {
      localStorage.setItem(TEMA_STORAGE_KEY, tema)
    } catch {
      // Storage indisponível (modo privado, etc.) — tema só não persiste.
    }
  }, [tema])

  // "Sistema" precisa reagir se a pessoa mudar o tema do SO/navegador com a
  // página já aberta, sem precisar recarregar.
  useEffect(() => {
    if (tema !== "sistema") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const ouvinte = () => aplicarTema("sistema")
    media.addEventListener("change", ouvinte)
    return () => media.removeEventListener("change", ouvinte)
  }, [tema])

  const definirTema = useCallback((novoTema: Tema) => setTema(novoTema), [])

  return (
    <ThemeContext.Provider value={{ tema, definirTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const contexto = useContext(ThemeContext)
  if (!contexto) throw new Error("useTheme precisa estar dentro de <ThemeProvider>")
  return contexto
}
