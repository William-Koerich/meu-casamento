"use client"

import { useState } from "react"
import Image from "next/image"

import { ExportPdfButton } from "@/components/app/export-pdf-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function QrCodeCard({
  link,
  qrCodeDataUrl,
}: {
  link: string
  qrCodeDataUrl: string
}) {
  const [copiado, setCopiado] = useState(false)

  async function copiarLink() {
    await navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Image
          src={qrCodeDataUrl}
          alt="QR code para envio de fotos"
          width={180}
          height={180}
          unoptimized
          className="shrink-0"
        />
        <div className="space-y-2">
          <p className="font-medium">
            Mostre esse QR code na festa para os convidados enviarem as fotos que tirarem.
          </p>
          <p className="text-muted-foreground text-sm break-all">{link}</p>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start print:hidden">
            <Button type="button" variant="outline" onClick={copiarLink}>
              {copiado ? "Link copiado!" : "Copiar link"}
            </Button>
            <ExportPdfButton rotulo="Imprimir" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
