"use client"

import { Button } from "@/components/ui/button"

export function ExportPdfButton({ rotulo = "Exportar PDF" }: { rotulo?: string }) {
  return (
    <Button variant="outline" className="print:hidden" onClick={() => window.print()}>
      {rotulo}
    </Button>
  )
}
