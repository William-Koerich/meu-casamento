import Link from "next/link"
import type { Metadata } from "next"

import { Separator } from "@/components/ui/separator"

import { GoogleButton } from "../google-button"
import { EntrarForm } from "./entrar-form"

export const metadata: Metadata = { title: "Entrar" }

export default async function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  const { redirecionar } = await searchParams
  const destino = typeof redirecionar === "string" ? redirecionar : undefined
  const sufixo = destino ? `?redirecionar=${encodeURIComponent(destino)}` : ""

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl">Entrar</h1>
        <p className="text-muted-foreground text-sm">
          Continue o planejamento do seu casamento.
        </p>
      </div>
      <GoogleButton redirecionarPara={destino ?? "/app"} />
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">ou com e-mail</span>
        <Separator className="flex-1" />
      </div>
      <EntrarForm redirecionarPara={destino} />
      <div className="text-muted-foreground space-y-2 text-center text-sm">
        <p>
          <Link href="/recuperar-senha" className="text-foreground underline">
            Esqueci minha senha
          </Link>
        </p>
        <p>
          Ainda não tem conta?{" "}
          <Link href={`/cadastro${sufixo}`} className="text-foreground underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
