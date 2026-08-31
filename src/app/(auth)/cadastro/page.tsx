import Link from "next/link"
import type { Metadata } from "next"

import { Separator } from "@/components/ui/separator"

import { GoogleButton } from "../google-button"
import { CadastroForm } from "./cadastro-form"

export const metadata: Metadata = { title: "Criar conta" }

export default function CadastroPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl">Criar conta</h1>
        <p className="text-muted-foreground text-sm">
          Comece a planejar o seu casamento agora.
        </p>
      </div>
      <GoogleButton />
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">ou com e-mail</span>
        <Separator className="flex-1" />
      </div>
      <CadastroForm />
      <p className="text-muted-foreground text-center text-sm">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-foreground underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
