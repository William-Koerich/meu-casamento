import { redirect } from "next/navigation"

import { getMinhaWedding } from "@/db/queries/weddings"

export default async function InicioPage() {
  const wedding = await getMinhaWedding()

  if (!wedding) redirect("/inicio/nomes")
  if (!wedding.dataCasamento || !wedding.cidade || !wedding.estado)
    redirect("/inicio/data")
  if (!wedding.convidadosEstimados) redirect("/inicio/convidados")
  if (!wedding.orcamentoTotal) redirect("/inicio/orcamento")
  redirect("/inicio/estilo")
}
