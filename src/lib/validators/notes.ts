import { z } from "zod"

export const notaCorSchema = z.enum(["amarelo", "rosa", "azul", "verde", "lilas"])

// Sem exigir texto não-vazio: a nota nasce em branco (a dona escolhe a cor e
// só depois escreve) e o autosave grava a cada pausa de digitação.
export const notaConteudoSchema = z.string().max(2000, "Máximo de 2000 caracteres.")
