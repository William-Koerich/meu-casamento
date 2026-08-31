import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getMinhaWedding } from "@/db/queries/weddings"

import { Progresso } from "../progresso"
import { DataForm } from "./data-form"

export const metadata: Metadata = { title: "Data e local" }

export default async function DataPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) redirect("/inicio/nomes")

  return (
    <div>
      <Progresso atual={2} />
      <h1 className="font-heading mb-1 text-2xl">Quando e onde?</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Não precisa ser definitivo — dá para ajustar depois.
      </p>
      <DataForm
        valoresIniciais={{
          dataCasamento: wedding.dataCasamento ?? "",
          cidade: wedding.cidade ?? "",
          estado: wedding.estado ?? "",
        }}
      />
    </div>
  )
}
