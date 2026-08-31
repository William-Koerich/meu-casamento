import Link from "next/link"
import type { Metadata } from "next"

import { RecuperarSenhaForm } from "./recuperar-senha-form"

export const metadata: Metadata = { title: "Recuperar senha" }

export default function RecuperarSenhaPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl">Recuperar senha</h1>
        <p className="text-muted-foreground text-sm">
          Enviaremos um link para você criar uma nova senha.
        </p>
      </div>
      <RecuperarSenhaForm />
      <p className="text-muted-foreground text-center text-sm">
        <Link href="/entrar" className="text-foreground underline">
          Voltar para o login
        </Link>
      </p>
    </div>
  )
}
