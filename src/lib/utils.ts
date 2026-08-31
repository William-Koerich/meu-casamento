import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ACENTOS: Record<string, string> = {
  á: "a",
  à: "a",
  â: "a",
  ã: "a",
  ä: "a",
  é: "e",
  è: "e",
  ê: "e",
  ë: "e",
  í: "i",
  ì: "i",
  î: "i",
  ï: "i",
  ó: "o",
  ò: "o",
  ô: "o",
  õ: "o",
  ö: "o",
  ú: "u",
  ù: "u",
  û: "u",
  ü: "u",
  ç: "c",
  ñ: "n",
}

export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .split("")
    .map((caractere) => ACENTOS[caractere] ?? caractere)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const CARACTERES_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function gerarCodigo(tamanho = 6): string {
  let codigo = ""
  for (let i = 0; i < tamanho; i++) {
    codigo += CARACTERES_CODIGO[Math.floor(Math.random() * CARACTERES_CODIGO.length)]
  }
  return codigo
}
