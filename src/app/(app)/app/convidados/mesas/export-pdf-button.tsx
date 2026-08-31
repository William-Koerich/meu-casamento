"use client"

import { Button } from "@/components/ui/button"

export function ExportPdfButton() {
  return (
    <Button variant="outline" className="print:hidden" onClick={() => window.print()}>
      Exportar PDF
    </Button>
  )
}
