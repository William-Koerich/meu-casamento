import { z } from "zod"

import { momentoMusicaEnum } from "@/db/schema"

const momentos = momentoMusicaEnum.enumValues as [string, ...string[]]

export const musicaSchema = z.object({
  titulo: z.string().trim().min(1, "Informe o título."),
  artista: z.string().trim().optional(),
  momento: z.enum(momentos, { error: "Escolha um momento." }),
  spotifyUrl: z.string().trim().optional(),
})

export type MusicaInput = z.infer<typeof musicaSchema>
