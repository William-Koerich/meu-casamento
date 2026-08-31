import Link from "next/link"

import { Button } from "@/components/ui/button"
import { NOME_PRODUTO } from "@/lib/site"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-muted-foreground text-sm tracking-widest uppercase">
        {NOME_PRODUTO}
      </p>
      <h1 className="font-heading mt-3 text-4xl">Página não encontrada</h1>
      <p className="text-muted-foreground mt-3 max-w-sm">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Voltar para o início</Link>
      </Button>
    </div>
  )
}
