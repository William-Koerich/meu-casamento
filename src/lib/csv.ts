export function parseCsv(texto: string): string[][] {
  const linhas: string[][] = []
  let linhaAtual: string[] = []
  let campoAtual = ""
  let dentroDeAspas = false

  for (let i = 0; i < texto.length; i++) {
    const caractere = texto[i]

    if (dentroDeAspas) {
      if (caractere === '"') {
        if (texto[i + 1] === '"') {
          campoAtual += '"'
          i++
        } else {
          dentroDeAspas = false
        }
      } else {
        campoAtual += caractere
      }
      continue
    }

    if (caractere === '"') {
      dentroDeAspas = true
    } else if (caractere === ",") {
      linhaAtual.push(campoAtual)
      campoAtual = ""
    } else if (caractere === "\n" || caractere === "\r") {
      if (caractere === "\r" && texto[i + 1] === "\n") i++
      linhaAtual.push(campoAtual)
      linhas.push(linhaAtual)
      linhaAtual = []
      campoAtual = ""
    } else {
      campoAtual += caractere
    }
  }

  if (campoAtual || linhaAtual.length > 0) {
    linhaAtual.push(campoAtual)
    linhas.push(linhaAtual)
  }

  return linhas.filter((linha) => linha.some((campo) => campo.trim() !== ""))
}

export function arrayParaCsv(linhas: (string | number)[][]): string {
  return linhas
    .map((linha) =>
      linha.map((valor) => `"${String(valor).replaceAll('"', '""')}"`).join(",")
    )
    .join("\n")
}

export function baixarCsv(nomeArquivo: string, conteudoCsv: string) {
  const blob = new Blob([`﻿${conteudoCsv}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nomeArquivo
  link.click()
  URL.revokeObjectURL(url)
}
