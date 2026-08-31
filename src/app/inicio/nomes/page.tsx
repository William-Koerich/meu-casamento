import type { Metadata } from "next"

import { getMinhaWedding } from "@/db/queries/weddings"

import { Progresso } from "../progresso"
import { NomesForm } from "./nomes-form"

export const metadata: Metadata = { title: "Nomes do casal" }

export default async function NomesPage() {
  const wedding = await getMinhaWedding()

  return (
    <div>
      <Progresso atual={1} />
      <h1 className="font-heading mb-1 text-2xl">Quem vai casar?</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Comece com o nome da noiva e do noivo.
      </p>
      <NomesForm
        valoresIniciais={{
          nomeNoiva: wedding?.nomeNoiva ?? "",
          nomeNoivo: wedding?.nomeNoivo ?? "",
        }}
      />
    </div>
  )
}
