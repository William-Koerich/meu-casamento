// Preferência de tema é UI, não dado de negócio — localStorage é o lugar
// certo aqui (diferente do rascunho de onboarding, que vive no banco).
export const TEMA_STORAGE_KEY = "meu-casamento:tema"

export type Tema = "claro" | "escuro" | "sistema"

export function ehTema(valor: string | null): valor is Tema {
  return valor === "claro" || valor === "escuro" || valor === "sistema"
}

/**
 * Roda inline no `<head>`, antes do React hidratar, pra aplicar a classe
 * `dark` no `<html>` já no primeiro paint — sem isso a página nasce clara e
 * "pisca" pro tema salvo um instante depois (flash of wrong theme).
 */
export const SCRIPT_TEMA_INICIAL = `
(function () {
  try {
    var tema = localStorage.getItem("${TEMA_STORAGE_KEY}") || "sistema";
    var escuro =
      tema === "escuro" ||
      (tema === "sistema" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", escuro);
  } catch (e) {}
})();
`
