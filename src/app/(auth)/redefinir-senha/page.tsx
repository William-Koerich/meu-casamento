import type { Metadata } from "next"

import { RedefinirSenhaForm } from "./redefinir-senha-form"

export const metadata: Metadata = { title: "Redefinir senha" }

export default function RedefinirSenhaPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl">Redefinir senha</h1>
        <p className="text-muted-foreground text-sm">
          Escolha uma nova senha para sua conta.
        </p>
      </div>
      <RedefinirSenhaForm />
    </div>
  )
}
