import QRCode from "qrcode"
import type { Metadata } from "next"

import { obterUrlsAssinadas } from "@/actions/storage"
import { getFotosConvidados } from "@/db/queries/guest-photos"
import { getMinhaWedding } from "@/db/queries/weddings"
import { getUrlBase } from "@/lib/site"

import { FotosConvidadosGrid } from "./fotos-convidados-grid"
import { QrCodeCard } from "./qr-code-card"

export const metadata: Metadata = { title: "Fotos dos convidados" }

export default async function FotosConvidadosPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const fotos = await getFotosConvidados(wedding.id)
  const urls = await obterUrlsAssinadas(
    "fotos-convidados",
    fotos.map((foto) => foto.caminho)
  )
  const fotosComUrl = fotos.map((foto) => ({
    ...foto,
    urlAssinada: urls[foto.caminho] ?? null,
  }))

  const linkUpload = `${getUrlBase()}/c/${wedding.slug}/fotos`
  const qrCodeDataUrl = await QRCode.toDataURL(linkUpload, { margin: 1, width: 240 })

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Fotos dos convidados</h1>
      <QrCodeCard link={linkUpload} qrCodeDataUrl={qrCodeDataUrl} />
      <FotosConvidadosGrid fotos={fotosComUrl} />
    </div>
  )
}
